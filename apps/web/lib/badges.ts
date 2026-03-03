/**
 * Badge Evaluation Engine
 *
 * Checks badge conditions after relevant events and idempotently
 * awards badges. Each badge has criteria stored as JSON in badge_definitions.
 *
 * Criteria types:
 *   - streak: { days: N }          — current streak >= N
 *   - xp_total: { amount: N }      — total XP >= N
 *   - lessons_completed: { count: N } — total completed lessons >= N
 *   - modules_completed: { count: N } — total completed modules >= N
 *   - paths_completed: { count: N }   — total completed paths >= N
 *   - quizzes_passed: { count: N }    — total passed quizzes >= N
 *   - quiz_perfect: { count: N }      — quizzes with 100% >= N
 *   - labs_completed: { count: N }    — total completed labs >= N
 *   - skill_score: { min_score: N }   — any domain composite >= N
 */

import { createAdminClient } from "@/lib/supabase/server";
import { awardXPWithLog } from "@/lib/xp-rewards";
import { createNotification } from "@/lib/notifications";

// ── Types ────────────────────────────────────────────────────────────────────

interface BadgeCriteria {
  type: string;
  days?: number;
  amount?: number;
  count?: number;
  min_score?: number;
}

interface BadgeDef {
  id: string;
  name: string;
  category: string;
  tier: string;
  criteria: BadgeCriteria;
  xp_reward: number;
}

export interface BadgeEvalResult {
  newBadges: Array<{ id: string; name: string; tier: string; xpAwarded: number }>;
}

// ── User stats snapshot ──────────────────────────────────────────────────────

interface UserStats {
  currentStreak: number;
  totalXp: number;
  lessonsCompleted: number;
  modulesCompleted: number;
  pathsCompleted: number;
  quizzesPassed: number;
  quizPerfectCount: number;
  labsCompleted: number;
  maxSkillScore: number;
}

async function getUserStats(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<UserStats> {
  const [
    { data: profile },
    { data: lessons },
    { data: modules },
    { data: paths },
    { data: quizzes },
    { data: labs },
    { data: skills },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("current_streak, total_xp")
      .eq("id", userId)
      .single(),
    supabase
      .from("lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed"),
    supabase
      .from("module_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("percentage", 100),
    supabase
      .from("path_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("percentage", 100),
    supabase
      .from("quiz_attempts")
      .select("score, total_questions, correct_answers, passed")
      .eq("user_id", userId),
    supabase
      .from("lab_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed"),
    supabase
      .from("skill_scores")
      .select("composite_score")
      .eq("user_id", userId)
      .order("composite_score", { ascending: false })
      .limit(1),
  ]);

  const quizData = quizzes ?? [];
  const quizzesPassed = quizData.filter((q) => q.passed).length;
  const quizPerfectCount = quizData.filter(
    (q) => q.correct_answers === q.total_questions && q.total_questions > 0,
  ).length;

  return {
    currentStreak: profile?.current_streak ?? 0,
    totalXp: profile?.total_xp ?? 0,
    lessonsCompleted: lessons?.length ?? 0,
    modulesCompleted: modules?.length ?? 0,
    pathsCompleted: paths?.length ?? 0,
    quizzesPassed,
    quizPerfectCount,
    labsCompleted: labs?.length ?? 0,
    maxSkillScore: skills?.[0]?.composite_score ?? 0,
  };
}

// ── Evaluation ───────────────────────────────────────────────────────────────

function checkCriteria(criteria: BadgeCriteria, stats: UserStats): boolean {
  switch (criteria.type) {
    case "streak":
      return stats.currentStreak >= (criteria.days ?? 0);
    case "xp_total":
      return stats.totalXp >= (criteria.amount ?? 0);
    case "lessons_completed":
      return stats.lessonsCompleted >= (criteria.count ?? 0);
    case "modules_completed":
      return stats.modulesCompleted >= (criteria.count ?? 0);
    case "paths_completed":
      return stats.pathsCompleted >= (criteria.count ?? 0);
    case "quizzes_passed":
      return stats.quizzesPassed >= (criteria.count ?? 0);
    case "quiz_perfect":
      return stats.quizPerfectCount >= (criteria.count ?? 0);
    case "labs_completed":
      return stats.labsCompleted >= (criteria.count ?? 0);
    case "skill_score":
      return stats.maxSkillScore >= (criteria.min_score ?? 0);
    default:
      return false;
  }
}

/**
 * Evaluate all badge conditions for a user and award any newly earned badges.
 * Idempotent — already-earned badges are skipped.
 *
 * Call this after any significant event (lesson completion, streak update, etc.)
 */
export async function evaluateBadges(userId: string): Promise<BadgeEvalResult> {
  const supabase = createAdminClient();

  // Fetch all active badge definitions and user's existing badges in parallel
  const [{ data: allBadges }, { data: earnedBadges }, stats] = await Promise.all([
    supabase
      .from("badge_definitions")
      .select("id, name, category, tier, criteria, xp_reward")
      .eq("is_active", true),
    supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId),
    getUserStats(supabase, userId),
  ]);

  const definitions: BadgeDef[] = (allBadges ?? []).map((b) => ({
    ...b,
    criteria: b.criteria as unknown as BadgeCriteria,
  }));
  const earnedSet = new Set((earnedBadges ?? []).map((b) => b.badge_id));

  const newBadges: BadgeEvalResult["newBadges"] = [];

  for (const badge of definitions) {
    // Skip already earned
    if (earnedSet.has(badge.id)) continue;

    // Check if criteria are met
    if (!checkCriteria(badge.criteria, stats)) continue;

    // Award the badge
    await supabase.from("user_badges").insert({
      user_id: userId,
      badge_id: badge.id,
    });

    let xpAwarded = 0;

    // Award badge XP reward (if any)
    if (badge.xp_reward > 0) {
      const result = await awardXPWithLog({
        userId,
        amount: badge.xp_reward,
        source: "badge_earned",
        sourceId: badge.id,
        dedupKey: `badge_earned:${badge.id}`,
        metadata: { badgeName: badge.name, tier: badge.tier },
      });
      xpAwarded = result.awarded ? result.amount : 0;
    }

    // Notify the user
    createNotification({
      userId,
      type: "badge_earned",
      title: `Badge Earned: ${badge.name}`,
      message: `You earned the ${badge.name} badge!${xpAwarded > 0 ? ` +${xpAwarded} XP` : ""}`,
      data: { badgeId: badge.id, tier: badge.tier, xpReward: xpAwarded },
    }).catch((err) => console.error("Badge notification failed:", err));

    newBadges.push({
      id: badge.id,
      name: badge.name,
      tier: badge.tier,
      xpAwarded,
    });
  }

  return { newBadges };
}

/**
 * Get all badges for a user (earned + progress toward unearned).
 */
export async function getUserBadges(userId: string): Promise<{
  earned: Array<{
    badgeId: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    tier: string;
    earnedAt: string;
  }>;
  available: Array<{
    badgeId: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    tier: string;
  }>;
}> {
  const supabase = createAdminClient();

  const [{ data: allBadges }, { data: userBadges }] = await Promise.all([
    supabase
      .from("badge_definitions")
      .select("id, name, description, icon, category, tier")
      .eq("is_active", true),
    supabase
      .from("user_badges")
      .select("badge_id, earned_at")
      .eq("user_id", userId),
  ]);

  const earnedMap = new Map(
    (userBadges ?? []).map((b) => [b.badge_id, b.earned_at]),
  );

  const earned: Array<{
    badgeId: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    tier: string;
    earnedAt: string;
  }> = [];
  const available: Array<{
    badgeId: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    tier: string;
  }> = [];

  for (const badge of allBadges ?? []) {
    const earnedAt = earnedMap.get(badge.id);
    if (earnedAt) {
      earned.push({
        badgeId: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        tier: badge.tier,
        earnedAt,
      });
    } else {
      available.push({
        badgeId: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        tier: badge.tier,
      });
    }
  }

  return { earned, available };
}
