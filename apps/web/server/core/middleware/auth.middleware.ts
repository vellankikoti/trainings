/**
 * Authentication Middleware
 *
 * Validates the user's JWT via Clerk and attaches authenticated user context
 * to the request. Handles JIT profile creation for users whose webhook
 * profile sync was missed.
 *
 * Two variants:
 * - withAuth: requires authentication, rejects with 401 if missing
 * - withOptionalAuth: populates user context if available, passes through if not
 *
 * Usage:
 *   export const POST = withAuth(handler);
 *   export const GET = withOptionalAuth(handler);
 */

import { NextRequest } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "../database";
import { UnauthorizedError } from "../errors";
import { logger } from "../observability/logger";
import { cache } from "../cache";
import type { RouteHandler, RequestContext, AuthenticatedUser } from "./types";

const log = logger.child({ module: "auth" });

const PROFILE_CACHE_TTL = 300; // 5 minutes

// ---------------------------------------------------------------------------
// Profile resolution with JIT creation and caching
// ---------------------------------------------------------------------------

async function resolveProfile(clerkId: string): Promise<AuthenticatedUser | null> {
  // Check cache first
  const cacheKey = `profile:${clerkId}`;
  const cached = await cache.get<AuthenticatedUser>(cacheKey);
  if (cached) return cached;

  // Query database
  const { data: profile, error } = await db.admin
    .from("profiles")
    .select("id, role")
    .eq("clerk_id", clerkId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = "not found" — that's expected for JIT creation
    log.error("Profile lookup failed", error, { clerkId });
  }

  let user: AuthenticatedUser;

  if (profile) {
    user = {
      clerkId,
      profileId: profile.id,
      role: (profile.role ?? "learner") as AuthenticatedUser["role"],
    };
  } else {
    // JIT profile creation — webhook may have been missed
    const created = await jitCreateProfile(clerkId);
    if (!created) return null;
    user = created;
  }

  // Resolve org/institute membership for scoped roles
  if (user.role === "trainer" || user.role === "institute_admin") {
    const { data: membership } = await db.admin
      .from("institute_members")
      .select("institute_id")
      .eq("user_id", user.profileId)
      .limit(1)
      .single();

    if (membership) {
      user.instituteId = membership.institute_id;
    }
  }

  if (user.role === "recruiter" || user.role === "org_admin") {
    const { data: membership } = await db.admin
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.profileId)
      .limit(1)
      .single();

    if (membership) {
      user.orgId = membership.org_id;
    }
  }

  // Cache the resolved profile
  await cache.set(cacheKey, user, PROFILE_CACHE_TTL);

  return user;
}

// ---------------------------------------------------------------------------
// JIT Profile Creation
// ---------------------------------------------------------------------------

async function jitCreateProfile(clerkId: string): Promise<AuthenticatedUser | null> {
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkId);

    if (!clerkUser) {
      log.warn("Clerk user not found for JIT creation", { clerkId });
      return null;
    }

    const username =
      clerkUser.username ||
      clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] ||
      `user_${clerkId.slice(-8)}`;

    const { data: newProfile, error } = await db.admin
      .from("profiles")
      .insert({
        clerk_id: clerkId,
        username,
        display_name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || username,
        avatar_url: clerkUser.imageUrl,
        role: "learner",
      })
      .select("id")
      .single();

    if (error) {
      // Unique constraint violation — profile was created concurrently
      if (error.code === "23505") {
        log.info("Profile already exists (race condition handled)", { clerkId });
        const { data: existing } = await db.admin
          .from("profiles")
          .select("id, role")
          .eq("clerk_id", clerkId)
          .single();

        if (existing) {
          return {
            clerkId,
            profileId: existing.id,
            role: (existing.role ?? "learner") as AuthenticatedUser["role"],
          };
        }
      }

      log.error("JIT profile creation failed", error, { clerkId });
      return null;
    }

    log.info("JIT profile created", { clerkId, profileId: newProfile.id });

    return {
      clerkId,
      profileId: newProfile.id,
      role: "learner",
    };
  } catch (error) {
    log.error("JIT profile creation error", error, { clerkId });
    return null;
  }
}

// ---------------------------------------------------------------------------
// Middleware — requires authentication
// ---------------------------------------------------------------------------

export function withAuth(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, ctx: RequestContext): Promise<Response> => {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      throw new UnauthorizedError("Authentication required");
    }

    const user = await resolveProfile(clerkId);

    if (!user) {
      throw new UnauthorizedError("User profile not found");
    }

    ctx.user = user;

    return handler(req, ctx);
  };
}

// ---------------------------------------------------------------------------
// Middleware — optional authentication
// ---------------------------------------------------------------------------

export function withOptionalAuth(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, ctx: RequestContext): Promise<Response> => {
    try {
      const { userId: clerkId } = await auth();

      if (clerkId) {
        const user = await resolveProfile(clerkId);
        if (user) {
          ctx.user = user;
        }
      }
    } catch {
      // Auth failure in optional mode — continue without user context
      log.debug("Optional auth failed — continuing as anonymous", {
        requestId: ctx.requestId,
      });
    }

    return handler(req, ctx);
  };
}

// ---------------------------------------------------------------------------
// Cache invalidation
// ---------------------------------------------------------------------------

/**
 * Invalidate the cached profile for a user.
 * Call this when a user's role or membership changes.
 */
export async function invalidateProfileCache(clerkId: string): Promise<void> {
  await cache.del(`profile:${clerkId}`);
}
