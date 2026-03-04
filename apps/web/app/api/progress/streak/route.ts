import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureProfile } from "@/lib/progress";
import { updateStreak } from "@/lib/streaks";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { streakSchema, validateBody } from "@/lib/validations";
import { apiErrors, withLogging } from "@/lib/api-helpers";

export const POST = withLogging(async (request: Request) => {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return apiErrors.unauthorized();
  }

  // Rate limit: 30 requests/minute per user
  const rl = await rateLimit(`progress:${clerkId}`, RATE_LIMITS.progress);
  if (!rl.success) {
    return rateLimitResponse(rl);
  }

  const body = await request.json();
  const validated = validateBody(streakSchema, body);
  if (validated.error) {
    return apiErrors.badRequest(validated.error);
  }

  const { activityType, xpEarned } = validated.data;

  const profileId = await ensureProfile(clerkId);
  if (!profileId) {
    return apiErrors.notFound("Profile");
  }

  const result = await updateStreak(profileId, activityType, xpEarned);
  return NextResponse.json(result);
});
