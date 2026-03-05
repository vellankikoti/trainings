import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureProfile } from "@/lib/progress";
import { resetModuleProgress, resetPathProgress } from "@/lib/progress-reset";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { progressResetSchema, validateBody } from "@/lib/validations";
import { apiErrors, withLogging } from "@/lib/api-helpers";

/**
 * POST /api/progress/reset
 *
 * Resets progress for a module or entire path. Uses POST (not DELETE)
 * to avoid body-in-DELETE issues across proxies.
 *
 * Body: { scope: "module" | "path", pathSlug: string, moduleSlug?: string }
 * Response: { success, xpRemoved, newTotalXp, newLevel, lessonsReset, modulesReset }
 */
export const POST = withLogging(async (request: Request) => {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return apiErrors.unauthorized();
  }

  // Rate limit: 5 resets per hour
  const rl = await rateLimit(`progress-reset:${clerkId}`, RATE_LIMITS.progressReset);
  if (!rl.success) {
    return rateLimitResponse(rl);
  }

  const body = await request.json();
  const validated = validateBody(progressResetSchema, body);
  if (validated.error) {
    return apiErrors.badRequest(validated.error);
  }

  const { scope, pathSlug, moduleSlug } = validated.data;

  const profileId = await ensureProfile(clerkId);
  if (!profileId) {
    return apiErrors.notFound("Profile");
  }

  try {
    let result;

    if (scope === "module" && moduleSlug) {
      result = await resetModuleProgress(profileId, pathSlug, moduleSlug);
    } else if (scope === "path") {
      result = await resetPathProgress(profileId, pathSlug);
    } else {
      return apiErrors.badRequest("Invalid scope or missing moduleSlug");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[progress-reset] Reset failed:", error);
    return apiErrors.internal();
  }
});
