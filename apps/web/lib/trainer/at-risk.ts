/**
 * At-risk student detection algorithm.
 *
 * A student is considered "at risk" if any of these conditions are true:
 *  1. Inactive for 3+ days (no activity recorded)
 *  2. Declining XP trend (current week XP < 50% of previous week XP)
 *  3. Never started (enrolled but 0 lessons completed)
 *  4. Streak broken with previously strong streak (>7 days)
 */

import { createAdminClient } from "@/lib/supabase/server";

export type RiskLevel = "high" | "medium" | "low";

export interface AtRiskStudent {
  userId: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  riskLevel: RiskLevel;
  reasons: string[];
  daysSinceActive: number | null;
  totalXp: number;
  currentStreak: number;
  lessonsCompleted: number;
}

export async function detectAtRiskStudents(
  batchId: string,
): Promise<AtRiskStudent[]> {
  const supabase = createAdminClient();

  // Get enrolled students
  const { data: enrollments } = await supabase
    .from("batch_enrollments")
    .select(
      "user_id, profiles!batch_enrollments_user_id_fkey(id, display_name, username, avatar_url, total_xp, current_streak, longest_streak, last_activity_date)",
    )
    .eq("batch_id", batchId)
    .eq("status", "active");

  if (!enrollments || enrollments.length === 0) return [];

  const studentIds = enrollments.map((e) => e.user_id);

  // Get lesson completion counts
  const { data: lessonCounts } = await supabase
    .from("lesson_progress")
    .select("user_id")
    .in("user_id", studentIds)
    .eq("status", "completed");

  const completionMap = new Map<string, number>();
  for (const lc of lessonCounts ?? []) {
    completionMap.set(lc.user_id, (completionMap.get(lc.user_id) ?? 0) + 1);
  }

  // Get recent weekly XP from daily_activity
  const now = new Date();
  const twoWeeksAgo = new Date(
    now.getTime() - 14 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const oneWeekAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: recentActivity } = await supabase
    .from("daily_activity")
    .select("user_id, activity_date, xp_earned")
    .in("user_id", studentIds)
    .gte("activity_date", twoWeeksAgo);

  // Compute weekly XP per student
  const weeklyXp = new Map<string, { thisWeek: number; lastWeek: number }>();
  for (const a of recentActivity ?? []) {
    if (!weeklyXp.has(a.user_id)) {
      weeklyXp.set(a.user_id, { thisWeek: 0, lastWeek: 0 });
    }
    const entry = weeklyXp.get(a.user_id)!;
    if (a.activity_date >= oneWeekAgo) {
      entry.thisWeek += a.xp_earned;
    } else {
      entry.lastWeek += a.xp_earned;
    }
  }

  // Evaluate each student
  const atRisk: AtRiskStudent[] = [];

  for (const enrollment of enrollments) {
    const profile = enrollment.profiles as unknown as {
      id: string;
      display_name: string | null;
      username: string | null;
      avatar_url: string | null;
      total_xp: number;
      current_streak: number;
      longest_streak: number;
      last_activity_date: string | null;
    } | null;

    if (!profile) continue;

    const reasons: string[] = [];
    let riskLevel: RiskLevel = "low";

    // Calculate days since last activity
    let daysSinceActive: number | null = null;
    if (profile.last_activity_date) {
      daysSinceActive = Math.floor(
        (now.getTime() -
          new Date(profile.last_activity_date).getTime()) /
          (1000 * 60 * 60 * 24),
      );
    }

    // Check 1: Inactive 3+ days
    if (daysSinceActive === null || daysSinceActive >= 7) {
      reasons.push(
        daysSinceActive === null
          ? "Never been active"
          : `Inactive for ${daysSinceActive} days`,
      );
      riskLevel = "high";
    } else if (daysSinceActive >= 3) {
      reasons.push(`Inactive for ${daysSinceActive} days`);
      riskLevel = "medium";
    }

    // Check 2: Declining XP trend
    const xpData = weeklyXp.get(enrollment.user_id);
    if (xpData && xpData.lastWeek > 50) {
      if (xpData.thisWeek < xpData.lastWeek * 0.5) {
        reasons.push("XP declining significantly this week");
        if (riskLevel !== "high") riskLevel = "medium";
      }
    }

    // Check 3: Never started
    const completed = completionMap.get(enrollment.user_id) ?? 0;
    if (completed === 0 && profile.total_xp === 0) {
      reasons.push("Has not started any lessons");
      riskLevel = "high";
    }

    // Check 4: Broken strong streak
    if (
      profile.longest_streak >= 7 &&
      profile.current_streak === 0 &&
      daysSinceActive !== null &&
      daysSinceActive >= 2
    ) {
      reasons.push(
        `Lost a ${profile.longest_streak}-day streak`,
      );
      if (riskLevel !== "high") riskLevel = "medium";
    }

    if (reasons.length > 0) {
      atRisk.push({
        userId: enrollment.user_id,
        displayName: profile.display_name,
        username: profile.username,
        avatarUrl: profile.avatar_url,
        riskLevel,
        reasons,
        daysSinceActive,
        totalXp: profile.total_xp,
        currentStreak: profile.current_streak,
        lessonsCompleted: completed,
      });
    }
  }

  // Sort by risk level: high first, then medium, then low
  const riskOrder: Record<RiskLevel, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };
  atRisk.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);

  return atRisk;
}
