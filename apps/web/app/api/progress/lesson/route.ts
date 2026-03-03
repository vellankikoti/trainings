import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ensureProfile, updateLessonProgress } from "@/lib/progress";
import { updateStreak } from "@/lib/streaks";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { lessonProgressSchema, validateBody } from "@/lib/validations";
import {
  checkAndSendStreakMilestone,
  sendModuleCompletionEmail,
} from "@/lib/email-automation";

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

    // Fire-and-forget email notifications (non-blocking)
    // These are best-effort — don't let email failures block the response
    triggerEmailNotifications(
      profileId,
      moduleSlug,
      streakResult,
      result.moduleProgress,
    ).catch((err) => console.error("Email notification error:", err));
  }

  // Return enriched response with full server-authoritative state
  return NextResponse.json({
    ...result,
    streak: streakResult,
  });
}

/**
 * Trigger email notifications for streak milestones and module completions.
 * Runs in background — failures are logged but don't affect the API response.
 */
async function triggerEmailNotifications(
  profileId: string,
  moduleSlug: string,
  streakResult: { streak: number; milestone: number | null } | null,
  moduleProgress?: { percentage: number; completed: boolean },
) {
  const supabase = createAdminClient();
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("email, display_name")
    .eq("id", profileId)
    .single();

  if (!profile?.email) return;

  const name = profile.display_name || "there";
  const email = profile.email as string;

  // Streak milestone email (7, 30, 100 days)
  if (streakResult?.milestone) {
    await checkAndSendStreakMilestone(
      profileId,
      email,
      name,
      streakResult.milestone,
    );
  }

  // Module completion email
  if (moduleProgress?.completed) {
    const moduleName = moduleSlug
      .split("-")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    await sendModuleCompletionEmail(
      profileId,
      email,
      name,
      moduleName,
      moduleProgress.percentage > 0 ? Math.round(moduleProgress.percentage) : 0,
    );
  }
}
