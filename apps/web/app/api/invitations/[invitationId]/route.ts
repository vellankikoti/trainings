import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth, AuthError } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

type Params = { params: Promise<{ invitationId: string }> };

/**
 * DELETE /api/invitations/[invitationId] — Revoke a pending invitation.
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { invitationId } = await params;
    const ctx = await requireAuth();
    const supabase = createAdminClient();

    const { data: invitation } = await supabase
      .from("invitations")
      .select("id, status, invited_by, entity_type, entity_id")
      .eq("id", invitationId)
      .is("deleted_at", null)
      .single();

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: `Invitation is ${invitation.status}, cannot revoke` },
        { status: 409 }
      );
    }

    // Verify caller is the inviter or admin of entity or platform admin
    if (
      invitation.invited_by !== ctx.profileId &&
      ctx.role !== "admin" &&
      ctx.role !== "super_admin"
    ) {
      // Check if caller is admin of the entity
      let isEntityAdmin = false;
      if (invitation.entity_type === "organization") {
        const { data: m } = await supabase
          .from("org_members")
          .select("role")
          .eq("org_id", invitation.entity_id)
          .eq("user_id", ctx.profileId)
          .is("deleted_at", null)
          .single();
        isEntityAdmin = m?.role === "org_admin";
      } else {
        const { data: m } = await supabase
          .from("institute_members")
          .select("role")
          .eq("institute_id", invitation.entity_id)
          .eq("user_id", ctx.profileId)
          .is("deleted_at", null)
          .single();
        isEntityAdmin = m?.role === "institute_admin";
      }

      if (!isEntityAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const { error } = await supabase
      .from("invitations")
      .update({ status: "revoked", revoked_at: new Date().toISOString() })
      .eq("id", invitationId);

    if (error) {
      return NextResponse.json({ error: "Failed to revoke invitation" }, { status: 500 });
    }

    await logAudit({
      actorId: ctx.profileId,
      actorRole: ctx.role,
      action: "invitation.revoked",
      resourceType: "invitation",
      resourceId: invitationId,
      entityType: invitation.entity_type,
      entityId: invitation.entity_id,
    });

    return NextResponse.json({
      data: { invitation_id: invitationId, status: "revoked" },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
