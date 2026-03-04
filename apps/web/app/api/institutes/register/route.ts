import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth, AuthError } from "@/lib/auth";
import { instituteRegisterSchema, validateBody } from "@/lib/validations";
import { logAudit } from "@/lib/audit";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

/**
 * POST /api/institutes/register — Self-service institute registration.
 * Any authenticated user can register. Creates with pending_review status.
 */
export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAuth();

    // Rate limit: 3 registrations per hour per user
    const rl = await rateLimit(`registration:${ctx.profileId}`, RATE_LIMITS.registration);
    if (!rl.success) return rateLimitResponse(rl);

    const body = await request.json();
    const validated = validateBody(instituteRegisterSchema, body);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check if user already owns an institute
    const { data: existingInst } = await supabase
      .from("institutes")
      .select("id")
      .eq("owner_id", ctx.profileId)
      .is("deleted_at", null)
      .limit(1)
      .single();

    if (existingInst) {
      return NextResponse.json(
        { error: "You already own an institute. Contact support to register another." },
        { status: 409 }
      );
    }

    // Get approval setting
    const { data: setting } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "institute_registration_requires_approval")
      .single();

    const requiresApproval = setting?.value !== false && setting?.value !== "false";

    // Call atomic RPC function
    const { data, error } = await supabase.rpc("register_institute", {
      p_user_id: ctx.profileId,
      p_name: validated.data.name,
      p_slug: validated.data.slug,
      p_description: validated.data.description || "",
      p_website: validated.data.website || "",
      p_billing_email: validated.data.billing_email,
      p_requires_approval: requiresApproval,
    });

    if (error) {
      const msg = error.message || "";
      if (msg.includes("SLUG_TAKEN")) {
        return NextResponse.json({ error: "This URL slug is already taken" }, { status: 409 });
      }
      if (msg.includes("ALREADY_OWNS_ENTITY")) {
        return NextResponse.json({ error: "You already own an institute" }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to register institute" }, { status: 500 });
    }

    const result = data as unknown as { id: string; name: string; slug: string; status: string; approval_id: string | null };

    await logAudit({
      actorId: ctx.profileId,
      actorRole: ctx.role,
      action: "institute.created",
      resourceType: "institute",
      resourceId: result.id,
      entityType: "institute",
      entityId: result.id,
      newValues: { name: result.name, slug: result.slug, status: result.status },
    });

    return NextResponse.json(
      {
        data: {
          id: result.id,
          name: result.name,
          slug: result.slug,
          status: result.status,
          message: requiresApproval
            ? "Institute registered. Pending admin review."
            : "Institute created and active.",
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
