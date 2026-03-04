import { NextResponse, type NextRequest } from "next/server";
import { randomBytes, createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth, AuthError } from "@/lib/auth";
import { invitationCreateSchema, validateBody } from "@/lib/validations";
import { logAudit } from "@/lib/audit";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

/**
 * POST /api/invitations — Create and send an invitation.
 * Required: institute_admin, org_admin, admin, or super_admin.
 */
export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAuth();

    // Rate limit: 20 invitations per hour per user
    const rl = await rateLimit(`invitation:${ctx.profileId}`, RATE_LIMITS.invitation);
    if (!rl.success) return rateLimitResponse(rl);

    const body = await request.json();
    const validated = validateBody(invitationCreateSchema, body);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { email, entity_type, entity_id, role, message } = validated.data;
    const supabase = createAdminClient();

    // Verify the caller is an admin of the target entity
    if (ctx.role !== "admin" && ctx.role !== "super_admin") {
      if (entity_type === "organization") {
        const { data: membership } = await supabase
          .from("org_members")
          .select("role")
          .eq("org_id", entity_id)
          .eq("user_id", ctx.profileId)
          .is("deleted_at", null)
          .single();
        if (!membership || membership.role !== "org_admin") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      } else if (entity_type === "institute") {
        const { data: membership } = await supabase
          .from("institute_members")
          .select("role")
          .eq("institute_id", entity_id)
          .eq("user_id", ctx.profileId)
          .is("deleted_at", null)
          .single();
        if (!membership || membership.role !== "institute_admin") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }

    // Validate role matches entity type
    if (entity_type === "organization" && !["recruiter", "org_admin"].includes(role)) {
      return NextResponse.json({ error: "Role must be recruiter or org_admin for organizations" }, { status: 400 });
    }
    if (entity_type === "institute" && !["trainer", "institute_admin"].includes(role)) {
      return NextResponse.json({ error: "Role must be trainer or institute_admin for institutes" }, { status: 400 });
    }

    // Verify entity exists and is active
    const entityTable = entity_type === "organization" ? "organizations" : "institutes";
    const { data: entity } = await supabase
      .from(entityTable)
      .select("id, name, status")
      .eq("id", entity_id)
      .is("deleted_at", null)
      .single();

    if (!entity) {
      return NextResponse.json({ error: `${entity_type} not found` }, { status: 404 });
    }
    if ((entity as { status?: string }).status !== "active") {
      return NextResponse.json({ error: `${entity_type} is not active` }, { status: 422 });
    }

    // Check self-invite
    const { data: selfProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", ctx.profileId)
      .single();

    // Look up invitee's email from Clerk data or profile
    // For now, check if there's already a user with this email
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id, clerk_id")
      .eq("clerk_id", ctx.userId)
      .single();

    // Check for duplicate pending invitation
    const { data: existingInvite } = await supabase
      .from("invitations")
      .select("id")
      .eq("email", email.toLowerCase())
      .eq("entity_type", entity_type)
      .eq("entity_id", entity_id)
      .eq("status", "pending")
      .is("deleted_at", null)
      .single();

    if (existingInvite) {
      return NextResponse.json(
        { error: "A pending invitation already exists for this email" },
        { status: 409 }
      );
    }

    // Check if user is already a member
    const memberTable = entity_type === "organization" ? "org_members" : "institute_members";
    const entityCol = entity_type === "organization" ? "org_id" : "institute_id";

    // Find user by email to check membership
    // We can't easily look up by email since Clerk manages emails
    // So we skip this check for new users (they'll get checked on acceptance)

    // Generate secure token
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");

    // Create invitation
    const { data: invitation, error: insertErr } = await supabase
      .from("invitations")
      .insert({
        email: email.toLowerCase(),
        entity_type,
        entity_id,
        role,
        token_hash: tokenHash,
        status: "pending",
        message: message || null,
        invited_by: ctx.profileId,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id, email, entity_type, entity_id, role, status, expires_at, created_at")
      .single();

    if (insertErr) {
      if (insertErr.code === "23505") {
        return NextResponse.json(
          { error: "A pending invitation already exists for this email" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // Log audit
    await logAudit({
      actorId: ctx.profileId,
      actorRole: ctx.role,
      action: "invitation.sent",
      resourceType: "invitation",
      resourceId: invitation.id,
      entityType: entity_type,
      entityId: entity_id,
      newValues: { email: email.toLowerCase(), role },
    });

    // NOTE: token is NOT included in API response — it should only be sent via email.
    // TODO: Send email via Resend with the token link:
    // ${APP_URL}/invitations/accept?token=${token}
    return NextResponse.json({ data: invitation }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/invitations — List invitations (sent or received).
 */
export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAuth();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "received"; // sent | received
    const status = searchParams.get("status"); // pending | accepted | etc
    const token = searchParams.get("token"); // for token-based lookup

    const supabase = createAdminClient();

    // Token-based lookup (for accept page)
    if (token) {
      const tokenHash = createHash("sha256").update(token).digest("hex");
      const { data: invitation } = await supabase
        .from("invitations")
        .select("id, email, entity_type, entity_id, role, status, message, expires_at, created_at")
        .eq("token_hash", tokenHash)
        .eq("status", "pending")
        .is("deleted_at", null)
        .single();

      if (!invitation) {
        return NextResponse.json({ error: "Invitation not found or expired" }, { status: 404 });
      }

      // Get entity name
      const entityTable = invitation.entity_type === "organization" ? "organizations" : "institutes";
      const { data: entity } = await supabase
        .from(entityTable)
        .select("name")
        .eq("id", invitation.entity_id)
        .single();

      // Get inviter name
      const { data: inviter } = await supabase
        .from("invitations")
        .select("invited_by")
        .eq("id", invitation.id)
        .single();

      let inviterName = null;
      if (inviter?.invited_by) {
        const { data: inviterProfile } = await supabase
          .from("profiles")
          .select("display_name, username")
          .eq("id", inviter.invited_by)
          .single();
        inviterName = inviterProfile?.display_name || inviterProfile?.username;
      }

      return NextResponse.json({
        data: {
          ...invitation,
          entity_name: (entity as { name: string })?.name,
          invited_by_name: inviterName,
        },
      });
    }

    // List invitations
    let query = supabase
      .from("invitations")
      .select("id, email, entity_type, entity_id, role, status, message, expires_at, created_at, invited_by")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (type === "sent") {
      query = query.eq("invited_by", ctx.profileId);
    } else {
      // Show invitations that this user accepted/declined
      query = query.eq("accepted_by", ctx.profileId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: invitations } = await query.limit(50);

    return NextResponse.json({ data: { items: invitations ?? [] } });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
