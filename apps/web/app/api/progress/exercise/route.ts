import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureProfile, updateExerciseProgress } from "@/lib/progress";
import { updateStreak } from "@/lib/streaks";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { exerciseProgressSchema, validateBody } from "@/lib/validations";
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
  const validated = validateBody(exerciseProgressSchema, body);
  if (validated.error) {
    return apiErrors.badRequest(validated.error);
  }

  const { lessonSlug, exerciseId } = validated.data;

  const profileId = await ensureProfile(clerkId);
  if (!profileId) {
    return apiErrors.notFound("Profile");
  }

  const result = await updateExerciseProgress(profileId, lessonSlug, exerciseId);

  // Update streak and daily activity on completion
  if (result.xpAwarded > 0) {
    updateStreak(profileId, "exercise", result.xpAwarded).catch((err) =>
      console.error("Streak update failed:", err),
    );
  }

  return NextResponse.json(result);
});
