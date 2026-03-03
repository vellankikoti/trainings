import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";

type Params = { params: Promise<{ instituteId: string; memberId: string }> };

/**
 * PATCH /api/institutes/[instituteId]/members/[memberId] — update member role.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { instituteId, memberId } = await params;
    const ctx = await requireRole(
      "institute_admin",
      "admin",
      "super_admin",
    );

    if (
      ctx.role !== "admin" &&
      ctx.role !== "super_admin" &&
      ctx.instituteId !== instituteId
    ) {
      throw new AuthError("Forbidden", 403);
    }

    const body = await request.json();
    const role = body.role;
    if (role !== "trainer" && role !== "institute_admin") {
      return NextResponse.json(
        { error: "Role must be 'trainer' or 'institute_admin'" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("institute_members")
      .update({ role })
      .eq("id", memberId)
      .eq("institute_id", instituteId)
      .select("*, profiles!institute_members_user_id_fkey(id)")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 },
      );
    }

    // Update profile role to match
    const profileRef = data.profiles as unknown as { id: string } | null;
    if (profileRef) {
      await supabase
        .from("profiles")
        .update({ role })
        .eq("id", profileRef.id);
    }

    return NextResponse.json({ member: data });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/institutes/[instituteId]/members/[memberId] — remove member.
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { instituteId, memberId } = await params;
    const ctx = await requireRole(
      "institute_admin",
      "admin",
      "super_admin",
    );

    if (
      ctx.role !== "admin" &&
      ctx.role !== "super_admin" &&
      ctx.instituteId !== instituteId
    ) {
      throw new AuthError("Forbidden", 403);
    }

    const supabase = createAdminClient();

    // Get member info before deleting
    const { data: member } = await supabase
      .from("institute_members")
      .select("user_id")
      .eq("id", memberId)
      .eq("institute_id", instituteId)
      .single();

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 },
      );
    }

    // Prevent self-removal
    if (member.user_id === ctx.profileId) {
      return NextResponse.json(
        { error: "Cannot remove yourself from the institute" },
        { status: 400 },
      );
    }

    // Remove membership
    await supabase
      .from("institute_members")
      .delete()
      .eq("id", memberId)
      .eq("institute_id", instituteId);

    // Reset user role to learner if they have no other memberships
    const { count } = await supabase
      .from("institute_members")
      .select("id", { count: "exact", head: true })
      .eq("user_id", member.user_id);

    if ((count ?? 0) === 0) {
      await supabase
        .from("profiles")
        .update({ role: "learner" })
        .eq("id", member.user_id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
