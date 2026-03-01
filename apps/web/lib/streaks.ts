import { createAdminClient } from "@/lib/supabase/server";
import { XP_REWARDS } from "@/lib/xp";
import { awardXP } from "@/lib/progress";

/**
 * Update streak and daily activity when a user completes any activity.
 * Call this after lesson/exercise/quiz completion.
 */
export async function updateStreak(
  userId: string,
  activityType: "lesson" | "exercise" | "quiz",
  xpEarned: number,
): Promise<{ streak: number; streakXPAwarded: boolean }> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Get current profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak, last_activity_date")
    .eq("id", userId)
    .single();

  if (!profile) throw new Error("Profile not found");

  let newStreak = profile.current_streak;
  let streakXPAwarded = false;

  // Calculate streak
  if (profile.last_activity_date === today) {
    // Already active today — streak stays the same, no streak XP
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (profile.last_activity_date === yesterdayStr) {
      // Active yesterday — increment streak
      newStreak = profile.current_streak + 1;
    } else {
      // Gap > 1 day — reset streak
      newStreak = 1;
    }

    // Award daily streak XP (only once per day)
    await awardXP(userId, XP_REWARDS.DAILY_STREAK, "daily_streak");
    streakXPAwarded = true;
  }

  const longestStreak = Math.max(newStreak, profile.longest_streak);

  // Update profile streak info
  await supabase
    .from("profiles")
    .update({
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_activity_date: today,
    })
    .eq("id", userId);

  // Update daily activity
  const { data: existingActivity } = await supabase
    .from("daily_activity")
    .select("id, lessons_completed, exercises_completed, quizzes_completed, xp_earned, time_spent_seconds")
    .eq("user_id", userId)
    .eq("activity_date", today)
    .single();

  if (existingActivity) {
    const updates: Record<string, number> = {
      xp_earned: existingActivity.xp_earned + xpEarned,
    };
    if (activityType === "lesson") {
      updates.lessons_completed = existingActivity.lessons_completed + 1;
    } else if (activityType === "exercise") {
      updates.exercises_completed = existingActivity.exercises_completed + 1;
    } else if (activityType === "quiz") {
      updates.quizzes_completed = existingActivity.quizzes_completed + 1;
    }

    await supabase
      .from("daily_activity")
      .update(updates)
      .eq("id", existingActivity.id);
  } else {
    await supabase.from("daily_activity").insert({
      user_id: userId,
      activity_date: today,
      lessons_completed: activityType === "lesson" ? 1 : 0,
      exercises_completed: activityType === "exercise" ? 1 : 0,
      quizzes_completed: activityType === "quiz" ? 1 : 0,
      xp_earned: xpEarned,
      time_spent_seconds: 0,
    });
  }

  return { streak: newStreak, streakXPAwarded };
}
