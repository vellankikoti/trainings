import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth, AuthError } from "@/lib/auth";
import { memberRoleUpdateSchema, validateBody } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

type Params = { params: Promise<{ instituteId: string; memberId: string }> };

/**
 * PATCH /api/institutes/[instituteId]/members/[memberId] — Update member role.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { instituteId, memberId } = await params;
    const ctx = await requireAuth();
    const supabase = createAdminClient();

    // Verify caller is institute_admin of this institute or platform admin
    const isAdmin = ctx.role === "admin" || ctx.role === "super_admin";
    if (!isAdmin) {
      const { data: callerMembership } = await supabase
        .from("institute_members")
        .select("role")
        .eq("institute_id", instituteId)
        .eq("user_id", ctx.profileId)
        .is("deleted_at", null)
        .single();

      if (callerMembership?.role !== "institute_admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const body = await request.json().catch(() => ({}));
    const validated = validateBody(memberRoleUpdateSchema, body);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 422 });
    }

    // Ensure role is institute-scoped
    const newRole = validated.data.role;
    if (newRole !== "trainer" && newRole !== "institute_admin") {
      return NextResponse.json(
        { error: "Role must be 'trainer' or 'institute_admin' for institutes" },
        { status: 422 }
      );
    }

    // Fetch target membership
    const { data: member } = await supabase
      .from("institute_members")
      .select("id, user_id, role")
      .eq("institute_id", instituteId)
      .eq("user_id", memberId)
      .is("deleted_at", null)
      .single();

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Prevent demoting the last institute_admin
    if (member.role === "institute_admin" && newRole !== "institute_admin") {
      const { count } = await supabase
        .from("institute_members")
        .select("id", { count: "exact", head: true })
        .eq("institute_id", instituteId)
        .eq("role", "institute_admin")
        .is("deleted_at", null);

      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          { error: "Cannot demote the last admin" },
          { status: 409 }
        );
      }
    }

    const oldRole = member.role;
    await supabase
      .from("institute_members")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("institute_id", instituteId)
      .eq("user_id", memberId);

    // Update profile role to match
    await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", memberId);

    await logAudit({
      actorId: ctx.profileId,
      actorRole: ctx.role,
      action: "member.role_changed",
      resourceType: "membership",
      resourceId: member.id,
      entityType: "institute",
      entityId: instituteId,
      oldValues: { role: oldRole },
      newValues: { role: newRole },
    });

    return NextResponse.json({
      data: { member_id: memberId, institute_id: instituteId, role: newRole },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/institutes/[instituteId]/members/[memberId] — Remove a member.
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { instituteId, memberId } = await params;
    const ctx = await requireAuth();
    const supabase = createAdminClient();

    // Caller must be institute_admin, platform admin, or self-removing
    const isSelf = ctx.profileId === memberId;
    const isAdmin = ctx.role === "admin" || ctx.role === "super_admin";

    if (!isSelf && !isAdmin) {
      const { data: callerMembership } = await supabase
        .from("institute_members")
        .select("role")
        .eq("institute_id", instituteId)
        .eq("user_id", ctx.profileId)
        .is("deleted_at", null)
        .single();

      if (callerMembership?.role !== "institute_admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Use atomic RPC to handle last-admin check and role reversion
    const { error } = await supabase.rpc("remove_member", {
      p_entity_type: "institute",
      p_entity_id: instituteId,
      p_user_id: memberId,
      p_removed_by: ctx.profileId,
    });

    if (error) {
      if (error.message.includes("not a member")) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
      }
      if (error.message.includes("last admin")) {
        return NextResponse.json(
          { error: "Cannot remove the last admin" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
    }

    await logAudit({
      actorId: ctx.profileId,
      actorRole: ctx.role,
      action: isSelf ? "member.left" : "member.removed",
      resourceType: "membership",
      entityType: "institute",
      entityId: instituteId,
      metadata: { removed_user_id: memberId },
    });

    return NextResponse.json({
      data: { member_id: memberId, institute_id: instituteId, status: "removed" },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
