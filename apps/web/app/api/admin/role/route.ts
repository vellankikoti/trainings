import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, AuthError } from "@/lib/auth/get-auth-context";
import { isValidRole } from "@/lib/auth/rbac";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * PATCH /api/admin/role
 *
 * Update a user's role. Admin and super_admin only.
 * Body: { userId: string, role: string }
 */

const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.string().refine(isValidRole, { message: "Invalid role" }),
});

export async function PATCH(req: Request) {
  try {
    await requireRole("admin", "super_admin");
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    throw e;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { userId, role } = parsed.data;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select("id, clerk_id, role")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, profile: data });
}

/**
 * GET /api/admin/role?userId=...
 *
 * Get a user's current role. Admin and super_admin only.
 */
export async function GET(req: Request) {
  try {
    await requireRole("admin", "super_admin");
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    throw e;
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, clerk_id, username, display_name, role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ profile: data });
}
