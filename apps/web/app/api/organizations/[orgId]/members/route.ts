import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";
import { orgMemberSchema, validateBody } from "@/lib/validations";

type Params = { params: Promise<{ orgId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { orgId } = await params;
    const ctx = await requireRole(
      "recruiter",
      "org_admin",
      "admin",
      "super_admin",
    );

    if (
      ctx.role !== "admin" &&
      ctx.role !== "super_admin" &&
      ctx.orgId !== orgId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createAdminClient();
    const { data } = await supabase
      .from("org_members")
      .select(
        "id, role, joined_at, profiles!org_members_user_id_fkey(id, display_name, username, avatar_url)",
      )
      .eq("org_id", orgId)
      .is("deleted_at", null)
      .order("joined_at", { ascending: true });

    return NextResponse.json(data ?? []);
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

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { orgId } = await params;
    const ctx = await requireRole("org_admin", "admin", "super_admin");

    if (
      ctx.role !== "admin" &&
      ctx.role !== "super_admin" &&
      ctx.orgId !== orgId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validated = validateBody(orgMemberSchema, body);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { username, role } = validated.data;
    const supabase = createAdminClient();

    // Find user by username
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("username", username)
      .is("deleted_at", null)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: `User "${username}" not found` },
        { status: 404 },
      );
    }

    // Check if already a member
    const { count } = await supabase
      .from("org_members")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("user_id", profile.id)
      .is("deleted_at", null);

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: `${username} is already a member` },
        { status: 409 },
      );
    }

    // Add membership
    const { error: insertErr } = await supabase
      .from("org_members")
      .insert({
        org_id: orgId,
        user_id: profile.id,
        role,
        invited_by: ctx.profileId,
      });

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // Upgrade profile role if currently learner
    if (profile.role === "learner") {
      await supabase
        .from("profiles")
        .update({ role })
        .eq("id", profile.id);
    }

    return NextResponse.json(
      { message: `${username} added as ${role}` },
      { status: 201 },
    );
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
