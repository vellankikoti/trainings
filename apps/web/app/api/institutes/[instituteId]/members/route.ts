import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";
import { instituteMemberSchema, validateBody } from "@/lib/validations";

type Params = { params: Promise<{ instituteId: string }> };

function verifyAccess(
  ctx: { role: string; instituteId?: string },
  instituteId: string,
) {
  if (ctx.role === "admin" || ctx.role === "super_admin") return;
  if (ctx.instituteId !== instituteId) {
    throw new AuthError("Forbidden", 403);
  }
}

/**
 * GET /api/institutes/[instituteId]/members — list members.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { instituteId } = await params;
    const ctx = await requireRole(
      "institute_admin",
      "admin",
      "super_admin",
    );
    verifyAccess(ctx, instituteId);

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("institute_members")
      .select(
        "id, role, joined_at, user_id, profiles!institute_members_user_id_fkey(id, display_name, username, avatar_url, email_notifications)",
      )
      .eq("institute_id", instituteId)
      .order("joined_at", { ascending: true });

    if (error) throw error;

    const members = (data ?? []).map((m) => {
      const profile = m.profiles as unknown as {
        id: string;
        display_name: string | null;
        username: string | null;
        avatar_url: string | null;
      } | null;
      return {
        id: m.id,
        userId: m.user_id,
        role: m.role,
        joinedAt: m.joined_at,
        displayName: profile?.display_name ?? null,
        username: profile?.username ?? null,
        avatarUrl: profile?.avatar_url ?? null,
      };
    });

    return NextResponse.json({ members });
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
 * POST /api/institutes/[instituteId]/members — invite/add a member.
 * Looks up user by username, sets their role, creates membership.
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { instituteId } = await params;
    const ctx = await requireRole(
      "institute_admin",
      "admin",
      "super_admin",
    );
    verifyAccess(ctx, instituteId);

    const body = await request.json();
    const validated = validateBody(instituteMemberSchema, body);
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
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: `User '${username}' not found` },
        { status: 404 },
      );
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from("institute_members")
      .select("id")
      .eq("institute_id", instituteId)
      .eq("user_id", profile.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "User is already a member of this institute" },
        { status: 409 },
      );
    }

    // Add member
    const { data: member, error: insertError } = await supabase
      .from("institute_members")
      .insert({
        institute_id: instituteId,
        user_id: profile.id,
        role,
        invited_by: ctx.profileId,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Update user role if they're currently just a learner
    if (profile.role === "learner") {
      await supabase
        .from("profiles")
        .update({ role })
        .eq("id", profile.id);
    }

    return NextResponse.json({ member }, { status: 201 });
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
