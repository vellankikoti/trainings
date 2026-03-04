import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth, AuthError } from "@/lib/auth";
import { orgRegisterSchema, validateBody } from "@/lib/validations";
import { logAudit } from "@/lib/audit";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

/**
 * POST /api/organizations/register — Self-service organization registration.
 * Any authenticated user can register. Creates with pending_review status.
 */
export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAuth();

    // Rate limit: 3 registrations per hour per user
    const rl = await rateLimit(`registration:${ctx.profileId}`, RATE_LIMITS.registration);
    if (!rl.success) return rateLimitResponse(rl);

    const body = await request.json();
    const validated = validateBody(orgRegisterSchema, body);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check if user already owns an organization
    const { data: existingOrg } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_id", ctx.profileId)
      .is("deleted_at", null)
      .limit(1)
      .single();

    if (existingOrg) {
      return NextResponse.json(
        { error: "You already own an organization. Contact support to register another." },
        { status: 409 }
      );
    }

    // Get approval setting
    const { data: setting } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "org_registration_requires_approval")
      .single();

    const requiresApproval = setting?.value !== false && setting?.value !== "false";

    // Call atomic RPC function
    const { data, error } = await supabase.rpc("register_organization", {
      p_user_id: ctx.profileId,
      p_name: validated.data.name,
      p_slug: validated.data.slug,
      p_description: validated.data.description || "",
      p_website: validated.data.website || "",
      p_company_size: validated.data.company_size || "",
      p_location_city: validated.data.location_city || "",
      p_location_country: validated.data.location_country || "",
      p_billing_email: validated.data.billing_email,
      p_requires_approval: requiresApproval,
    });

    if (error) {
      const msg = error.message || "";
      if (msg.includes("SLUG_TAKEN")) {
        return NextResponse.json({ error: "This URL slug is already taken" }, { status: 409 });
      }
      if (msg.includes("ALREADY_OWNS_ENTITY")) {
        return NextResponse.json({ error: "You already own an organization" }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to register organization" }, { status: 500 });
    }

    const result = data as unknown as { id: string; name: string; slug: string; status: string; approval_id: string | null };

    await logAudit({
      actorId: ctx.profileId,
      actorRole: ctx.role,
      action: "org.created",
      resourceType: "organization",
      resourceId: result.id,
      entityType: "organization",
      entityId: result.id,
      newValues: { name: result.name, slug: result.slug, status: result.status },
    });

    // TODO: If requires approval, send notification email to platform admins
    // TODO: Send confirmation email to the requester

    return NextResponse.json(
      {
        data: {
          id: result.id,
          name: result.name,
          slug: result.slug,
          status: result.status,
          message: requiresApproval
            ? "Organization registered. Pending admin review."
            : "Organization created and active.",
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
