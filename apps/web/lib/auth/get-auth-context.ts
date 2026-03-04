/**
 * Extracts a full AuthContext from the current request.
 *
 * Uses Clerk for the userId, then looks up the Supabase profile to get the
 * role, institute membership, and org membership.
 */

import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { AuthContext, Role } from "./rbac";

/**
 * Get the full auth context for the current request.
 * Returns null if the user is not authenticated.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createAdminClient();

  // Get profile with role
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("clerk_id", userId)
    .is("deleted_at", null)
    .single();

  if (!profile) return null;

  const ctx: AuthContext = {
    userId,
    profileId: profile.id,
    role: (profile.role ?? "learner") as Role,
  };

  // For institute-scoped roles, attach the institute ID
  // Order by joined_at ASC to deterministically pick the primary (earliest) membership
  if (ctx.role === "trainer" || ctx.role === "institute_admin") {
    const { data: membership } = await supabase
      .from("institute_members")
      .select("institute_id")
      .eq("user_id", profile.id)
      .is("deleted_at", null)
      .order("joined_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (membership) {
      ctx.instituteId = membership.institute_id;
    }
  }

  // For org-scoped roles, attach the org ID
  // Order by joined_at ASC to deterministically pick the primary (earliest) membership
  if (ctx.role === "recruiter" || ctx.role === "org_admin") {
    const { data: membership } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", profile.id)
      .is("deleted_at", null)
      .order("joined_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (membership) {
      ctx.orgId = membership.org_id;
    }
  }

  return ctx;
}

/**
 * Require authentication — throws a structured response if not authenticated.
 */
export async function requireAuth(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) {
    throw new AuthError("Unauthorized", 401);
  }
  return ctx;
}

/**
 * Require a specific role — throws if the user doesn't have the required role.
 */
export async function requireRole(...roles: Role[]): Promise<AuthContext> {
  const ctx = await requireAuth();
  if (!roles.includes(ctx.role)) {
    throw new AuthError(
      `Forbidden: requires one of [${roles.join(", ")}]`,
      403
    );
  }
  return ctx;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}
