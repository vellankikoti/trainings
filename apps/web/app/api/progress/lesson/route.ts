import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureProfile, updateLessonProgress } from "@/lib/progress";
import { updateStreak } from "@/lib/streaks";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { lessonProgressSchema, validateBody } from "@/lib/validations";

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 30 requests/minute per user
  const rl = rateLimit(`progress:${clerkId}`, RATE_LIMITS.progress);
  if (!rl.success) {
    return rateLimitResponse(rl);
  }

  const body = await request.json();
  const validated = validateBody(lessonProgressSchema, body);
  if (validated.error) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { pathSlug, moduleSlug, lessonSlug, status } = validated.data;

  const profileId = await ensureProfile(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const result = await updateLessonProgress(
    profileId,
    pathSlug,
    moduleSlug,
    lessonSlug,
    status,
  );

  // Update streak and daily activity on completion — AWAIT to ensure
  // data is persisted before the client can fetch dashboard data
  let streakResult: {
    streak: number;
    streakXPAwarded: boolean;
    milestone: number | null;
  } | null = null;

  if (status === "completed" && result.xpAwarded > 0) {
    try {
      streakResult = await updateStreak(profileId, "lesson", result.xpAwarded);
    } catch (err) {
      console.error("Streak update failed:", err);
    }
  }

  // Return enriched response with full server-authoritative state
  return NextResponse.json({
    ...result,
    streak: streakResult,
  });
}
