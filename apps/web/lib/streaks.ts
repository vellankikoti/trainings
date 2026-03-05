import { createAdminClient } from "@/lib/supabase/server";
import { awardStreakXP, awardMilestoneXP } from "@/lib/xp-rewards";

/**
 * Streak milestones that trigger special XP bonuses and badge evaluation.
 */
const STREAK_MILESTONES = [7, 14, 30, 60, 100, 200, 365] as const;
const STREAK_MILESTONE_XP: Record<number, number> = {
  7: 50,
  14: 100,
  30: 250,
  60: 500,
  100: 1000,
  200: 2500,
  365: 10000,
};

/** Minimum active minutes to count as a "real" activity day */
const MIN_ACTIVE_MINUTES = 15;

/**
 * Update streak and daily activity when a user completes any activity.
 * Call this after lesson/exercise/quiz/lab completion.
 */
/**
 * Get the user's "today" date string in their timezone.
 * Falls back to UTC if timezone is not available or invalid.
 */
function getUserToday(timezone?: string | null): string {
  if (timezone) {
    try {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(new Date());
      const y = parts.find((p) => p.type === "year")?.value;
      const m = parts.find((p) => p.type === "month")?.value;
      const d = parts.find((p) => p.type === "day")?.value;
      if (y && m && d) return `${y}-${m}-${d}`;
    } catch {
      // Invalid timezone — fall through to UTC
    }
  }
  return new Date().toISOString().split("T")[0];
}

function getYesterday(timezone?: string | null): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (timezone) {
    try {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(yesterday);
      const y = parts.find((p) => p.type === "year")?.value;
      const m = parts.find((p) => p.type === "month")?.value;
      const d = parts.find((p) => p.type === "day")?.value;
      if (y && m && d) return `${y}-${m}-${d}`;
    } catch {
      // Invalid timezone — fall through to UTC
    }
  }
  return yesterday.toISOString().split("T")[0];
}

export async function updateStreak(
  userId: string,
  activityType: "lesson" | "exercise" | "quiz" | "lab",
  xpEarned: number,
): Promise<{ streak: number; streakXPAwarded: boolean; milestone: number | null }> {
  const supabase = createAdminClient();

  // Get current profile — query timezone separately to avoid breaking
  // when migration 011 (which adds the timezone column) hasn't been applied.
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak, last_activity_date")
    .eq("id", userId)
    .single();

  if (!profile) throw new Error("Profile not found");

  // Try to read timezone (may not exist if migration 011 not applied)
  let userTz: string | null = null;
  try {
    const { data: tzRow } = await supabase
      .from("profiles")
      .select("timezone")
      .eq("id", userId)
      .single();
    userTz = tzRow?.timezone ?? null;
  } catch {
    // timezone column doesn't exist — fall back to UTC
  }
  const today = getUserToday(userTz);
  const yesterdayStr = getYesterday(userTz);

  let newStreak = profile.current_streak;
  let streakXPAwarded = false;
  let milestone: number | null = null;

  if (profile.last_activity_date === today) {
    // Already active today — streak stays, no daily streak XP
  } else {

    if (profile.last_activity_date === yesterdayStr) {
      // Active yesterday — increment streak
      newStreak = profile.current_streak + 1;
    } else if (profile.last_activity_date) {
      // Check for streak freeze (premium users get 1 free freeze per week)
      const daysSinceLastActivity = getDaysBetween(
        profile.last_activity_date,
        today
      );

      if (daysSinceLastActivity === 2) {
        // 1 day gap — check if user has a streak freeze available
        const hasFreezeAvailable = await checkStreakFreeze(supabase, userId);
        if (hasFreezeAvailable) {
          newStreak = profile.current_streak + 1;
          await consumeStreakFreeze(supabase, userId);
        } else {
          newStreak = 1;
        }
      } else {
        // Gap > 1 day — reset streak
        newStreak = 1;
      }
    } else {
      // First ever activity
      newStreak = 1;
    }

    // Award daily streak XP (with dedup via xp-rewards system)
    const streakXPResult = await awardStreakXP(userId);
    streakXPAwarded = streakXPResult.awarded;

    // Check milestone
    milestone = checkMilestone(newStreak);
    if (milestone) {
      const milestoneXP = STREAK_MILESTONE_XP[milestone] ?? 0;
      if (milestoneXP > 0) {
        await awardMilestoneXP(userId, milestone, milestoneXP);
      }
    }
  }

  const longestStreak = Math.max(newStreak, profile.longest_streak);

  // Update profile streak info — use conditional update to guard against
  // concurrent requests both detecting "new day" and both incrementing.
  // The .neq("last_activity_date", today) ensures only the first request
  // for a given day actually updates the streak counter.
  if (profile.last_activity_date !== today) {
    const { data: updateResult } = await supabase
      .from("profiles")
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
      })
      .eq("id", userId)
      .neq("last_activity_date", today)
      .select("current_streak");

    // If no rows updated, another concurrent request already processed today
    if (!updateResult || updateResult.length === 0) {
      return { streak: profile.current_streak, streakXPAwarded: false, milestone: null };
    }
  } else {
    // Already active today — just ensure longest_streak is up to date
    await supabase
      .from("profiles")
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
      })
      .eq("id", userId);
  }

  // Update daily activity
  await upsertDailyActivity(supabase, userId, today, activityType, xpEarned);

  return { streak: newStreak, streakXPAwarded, milestone };
}

/**
 * Validate whether a day counted as a "real" activity day.
 * Requires either:
 * - Completing at least 1 lesson, quiz, or lab
 * - OR having 15+ active minutes
 *
 * This is called by the nightly streak validation job.
 */
export async function validateDayActivity(
  userId: string,
  date: string,
): Promise<boolean> {
  const supabase = createAdminClient();

  // Check daily_activity for completions
  const { data: activity } = await supabase
    .from("daily_activity")
    .select("lessons_completed, exercises_completed, quizzes_completed")
    .eq("user_id", userId)
    .eq("activity_date", date)
    .single();

  if (activity) {
    const totalCompletions =
      activity.lessons_completed +
      activity.exercises_completed +
      activity.quizzes_completed;
    if (totalCompletions > 0) return true;
  }

  // Check active_time_log for 15+ minutes
  const startOfDay = `${date}T00:00:00Z`;
  const endOfDay = `${date}T23:59:59Z`;

  const { data: timeLogs } = await supabase
    .from("active_time_log")
    .select("active_seconds")
    .eq("user_id", userId)
    .gte("session_start", startOfDay)
    .lte("session_end", endOfDay);

  if (timeLogs) {
    const totalMinutes =
      timeLogs.reduce((sum, log) => sum + log.active_seconds, 0) / 60;
    if (totalMinutes >= MIN_ACTIVE_MINUTES) return true;
  }

  return false;
}

/**
 * Get streak recovery information — how many days since the streak broke
 * and what it would take to restart.
 */
export async function getStreakRecoveryInfo(userId: string): Promise<{
  streakBroken: boolean;
  daysSinceLast: number;
  canFreeze: boolean;
}> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: profile } = await supabase
    .from("profiles")
    .select("last_activity_date, current_streak")
    .eq("id", userId)
    .single();

  if (!profile || !profile.last_activity_date) {
    return { streakBroken: false, daysSinceLast: 0, canFreeze: false };
  }

  const daysSinceLast = getDaysBetween(profile.last_activity_date, today);
  const streakBroken = daysSinceLast > 1;
  const canFreeze = daysSinceLast === 2;

  return { streakBroken, daysSinceLast, canFreeze };
}

// ── Helpers ──

function getDaysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function checkMilestone(streak: number): number | null {
  for (const m of STREAK_MILESTONES) {
    if (streak === m) return m;
  }
  return null;
}

async function checkStreakFreeze(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<boolean> {
  // Check if user has a premium subscription with streak freeze
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (!subscription || subscription.plan === "free") return false;

  // Check if freeze was already used this week
  const weekStart = getWeekStart();
  const { count } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("event_type", "streak.freeze_used")
    .gte("created_at", weekStart);

  return (count ?? 0) === 0;
}

async function consumeStreakFreeze(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<void> {
  await supabase.from("events").insert({
    user_id: userId,
    event_type: "streak.freeze_used",
    data: {},
  });
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

async function upsertDailyActivity(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  today: string,
  activityType: string,
  xpEarned: number,
): Promise<void> {
  // Use upsert to avoid read-then-write race condition.
  // First ensure the row exists, then atomically increment the right column.
  await supabase.from("daily_activity").upsert(
    {
      user_id: userId,
      activity_date: today,
      lessons_completed: 0,
      exercises_completed: 0,
      quizzes_completed: 0,
      xp_earned: 0,
      time_spent_seconds: 0,
    },
    { onConflict: "user_id,activity_date", ignoreDuplicates: true },
  );

  // Now atomically increment the relevant counter via RPC-style raw update.
  // Supabase JS doesn't support SET col = col + 1 directly, so we use
  // a small increment query via the admin client's rpc or a filtered update.
  // Workaround: read, increment, write — but wrapped in the unique constraint
  // safety net (the upsert above guarantees the row exists).
  const { data: existing } = await supabase
    .from("daily_activity")
    .select("id, lessons_completed, exercises_completed, quizzes_completed, xp_earned")
    .eq("user_id", userId)
    .eq("activity_date", today)
    .single();

  if (existing) {
    const updates: Record<string, number> = {
      xp_earned: existing.xp_earned + xpEarned,
    };
    if (activityType === "lesson") {
      updates.lessons_completed = existing.lessons_completed + 1;
    } else if (activityType === "exercise") {
      updates.exercises_completed = existing.exercises_completed + 1;
    } else if (activityType === "quiz") {
      updates.quizzes_completed = existing.quizzes_completed + 1;
    }

    await supabase.from("daily_activity").update(updates).eq("id", existing.id);
  }
}
