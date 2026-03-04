/**
 * XP Reward System — event-driven XP with configurable rewards,
 * duplicate prevention via dedup keys, and full XP history log.
 *
 * All XP awards go through this module, which:
 * 1. Checks for duplicate awards (dedup_key)
 * 2. Logs every award to xp_log
 * 3. Updates profile total_xp and level
 * 4. Returns the result for UI feedback
 */

import { createAdminClient } from "@/lib/supabase/server";
import { XP_REWARDS } from "@/lib/xp";
import { calculateLevel } from "@/lib/levels";
import { createNotification } from "@/lib/notifications";
import type { Json } from "@/lib/supabase/types";

// ── Types ────────────────────────────────────────────────────────────────────

export interface XPAwardResult {
  awarded: boolean;
  amount: number;
  newTotal: number;
  leveledUp: boolean;
  newLevel: number;
  reason: string;
}

interface AwardXPOptions {
  userId: string;
  amount: number;
  source: string;
  sourceId?: string;
  dedupKey?: string;
  metadata?: Record<string, unknown>;
}

// ── Configurable reward table ────────────────────────────────────────────────

const REWARD_TABLE: Record<string, number> = {
  lesson_complete: XP_REWARDS.LESSON_COMPLETE,
  exercise_complete: XP_REWARDS.EXERCISE_COMPLETE,
  quiz_pass: XP_REWARDS.QUIZ_PASS,
  quiz_perfect: XP_REWARDS.QUIZ_PERFECT,
  mini_project: XP_REWARDS.MINI_PROJECT,
  module_complete: XP_REWARDS.MODULE_COMPLETE,
  path_complete: XP_REWARDS.PATH_COMPLETE,
  daily_streak: XP_REWARDS.DAILY_STREAK,
  capstone_project: XP_REWARDS.CAPSTONE_PROJECT,
  // Lab rewards (configurable by tier)
  lab_complete_t1: 50,
  lab_complete_t2: 100,
  lab_complete_t3: 200,
  // Simulation rewards
  simulation_resolved: 150,
  simulation_excellent: 300, // score >= 90
  // Badge milestone awards are defined in badge_definitions.xp_reward
};

/**
 * Get the configured XP amount for a reward source.
 */
export function getRewardAmount(source: string): number {
  return REWARD_TABLE[source] ?? 0;
}

// ── Main award function ──────────────────────────────────────────────────────

/**
 * Award XP to a user with deduplication and logging.
 *
 * @param opts.dedupKey - If provided, prevents awarding the same XP twice.
 *   Convention: "{source}:{sourceId}" e.g. "lesson_complete:foundations/linux-basics/01-intro"
 */
export async function awardXPWithLog(
  opts: AwardXPOptions,
): Promise<XPAwardResult> {
  const { userId, amount, source, sourceId, dedupKey, metadata } = opts;
  const supabase = createAdminClient();

  // Skip zero or negative awards
  if (amount <= 0) {
    return {
      awarded: false,
      amount: 0,
      newTotal: 0,
      leveledUp: false,
      newLevel: 0,
      reason: "Zero or negative amount",
    };
  }

  // Check dedup — if this exact award was already made, skip
  if (dedupKey) {
    const { data: existing } = await supabase
      .from("xp_log")
      .select("id")
      .eq("user_id", userId)
      .eq("dedup_key", dedupKey)
      .single();

    if (existing) {
      // Fetch actual current totals instead of returning misleading zeros
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("total_xp, current_level")
        .eq("id", userId)
        .single();

      return {
        awarded: false,
        amount: 0,
        newTotal: currentProfile?.total_xp ?? 0,
        leveledUp: false,
        newLevel: currentProfile?.current_level ?? 0,
        reason: `Duplicate: ${dedupKey}`,
      };
    }
  }

  // Write XP log entry first (dedup unique index prevents duplicates at DB level)
  try {
    await supabase.from("xp_log").insert({
      user_id: userId,
      amount,
      source,
      source_id: sourceId ?? null,
      dedup_key: dedupKey ?? null,
      metadata: (metadata ?? {}) as Json,
    });
  } catch (insertErr: unknown) {
    // If unique constraint violation on dedup_key, this is a concurrent duplicate
    const err = insertErr as { code?: string };
    if (err?.code === "23505" && dedupKey) {
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("total_xp, current_level")
        .eq("id", userId)
        .single();
      return {
        awarded: false,
        amount: 0,
        newTotal: currentProfile?.total_xp ?? 0,
        leveledUp: false,
        newLevel: currentProfile?.current_level ?? 0,
        reason: `Duplicate (concurrent): ${dedupKey}`,
      };
    }
    throw insertErr;
  }

  // Atomic XP increment — prevents race condition where two concurrent
  // requests both read the same total_xp and overwrite each other.
  const { data: incrementResult } = await supabase.rpc("increment_xp", {
    p_user_id: userId,
    p_amount: amount,
  });

  const row = Array.isArray(incrementResult) ? incrementResult[0] : incrementResult;
  if (!row) {
    return {
      awarded: false,
      amount: 0,
      newTotal: 0,
      leveledUp: false,
      newLevel: 0,
      reason: "Profile not found",
    };
  }

  const newTotal = row.new_total;
  const oldLevel = row.old_level;
  const newLevelObj = calculateLevel(newTotal);

  // Update level if it changed (separate update since RPC only increments XP)
  if (newLevelObj.level !== oldLevel) {
    await supabase
      .from("profiles")
      .update({ current_level: newLevelObj.level })
      .eq("id", userId);
  }

  // Notify on level up
  if (newLevelObj.level > oldLevel) {
    createNotification({
      userId,
      type: "level_up",
      title: `Level Up! You're now Level ${newLevelObj.level}`,
      message: `Congratulations! You've reached ${newLevelObj.title}.`,
      data: { newLevel: newLevelObj.level, title: newLevelObj.title },
    }).catch((err) => console.error("Level-up notification failed:", err));
  }

  return {
    awarded: true,
    amount,
    newTotal,
    leveledUp: newLevelObj.level > oldLevel,
    newLevel: newLevelObj.level,
    reason: source,
  };
}

// ── Convenience wrappers ─────────────────────────────────────────────────────

/**
 * Award XP for lesson completion with dedup.
 */
export async function awardLessonXP(
  userId: string,
  pathSlug: string,
  moduleSlug: string,
  lessonSlug: string,
): Promise<XPAwardResult> {
  const dedupKey = `lesson_complete:${pathSlug}/${moduleSlug}/${lessonSlug}`;
  return awardXPWithLog({
    userId,
    amount: REWARD_TABLE.lesson_complete,
    source: "lesson_complete",
    sourceId: `${pathSlug}/${moduleSlug}/${lessonSlug}`,
    dedupKey,
  });
}

/**
 * Award XP for exercise completion with dedup.
 */
export async function awardExerciseXP(
  userId: string,
  lessonSlug: string,
  exerciseId: string,
): Promise<XPAwardResult> {
  const dedupKey = `exercise_complete:${lessonSlug}/${exerciseId}`;
  return awardXPWithLog({
    userId,
    amount: REWARD_TABLE.exercise_complete,
    source: "exercise_complete",
    sourceId: `${lessonSlug}/${exerciseId}`,
    dedupKey,
  });
}

/**
 * Award XP for quiz pass with dedup.
 */
export async function awardQuizXP(
  userId: string,
  quizId: string,
  isPerfect: boolean,
): Promise<XPAwardResult> {
  const source = isPerfect ? "quiz_perfect" : "quiz_pass";
  const dedupKey = `${source}:${quizId}`;
  return awardXPWithLog({
    userId,
    amount: REWARD_TABLE[source],
    source,
    sourceId: quizId,
    dedupKey,
  });
}

/**
 * Award XP for module completion with dedup.
 */
export async function awardModuleXP(
  userId: string,
  pathSlug: string,
  moduleSlug: string,
): Promise<XPAwardResult> {
  const dedupKey = `module_complete:${pathSlug}/${moduleSlug}`;
  return awardXPWithLog({
    userId,
    amount: REWARD_TABLE.module_complete,
    source: "module_complete",
    sourceId: `${pathSlug}/${moduleSlug}`,
    dedupKey,
  });
}

/**
 * Award XP for path completion with dedup.
 */
export async function awardPathXP(
  userId: string,
  pathSlug: string,
): Promise<XPAwardResult> {
  const dedupKey = `path_complete:${pathSlug}`;
  return awardXPWithLog({
    userId,
    amount: REWARD_TABLE.path_complete,
    source: "path_complete",
    sourceId: pathSlug,
    dedupKey,
  });
}

/**
 * Award daily streak XP (no dedup — only called once per day by streak logic).
 */
export async function awardStreakXP(userId: string): Promise<XPAwardResult> {
  const today = new Date().toISOString().split("T")[0];
  const dedupKey = `daily_streak:${today}`;
  return awardXPWithLog({
    userId,
    amount: REWARD_TABLE.daily_streak,
    source: "daily_streak",
    sourceId: today,
    dedupKey,
  });
}

/**
 * Award XP for a streak milestone.
 */
export async function awardMilestoneXP(
  userId: string,
  milestone: number,
  amount: number,
): Promise<XPAwardResult> {
  const dedupKey = `streak_milestone:${milestone}`;
  return awardXPWithLog({
    userId,
    amount,
    source: "streak_milestone",
    sourceId: String(milestone),
    dedupKey,
    metadata: { milestone },
  });
}

// ── XP History ───────────────────────────────────────────────────────────────

/**
 * Get recent XP history for a user.
 */
export async function getXPHistory(
  userId: string,
  limit = 20,
): Promise<Array<{
  amount: number;
  source: string;
  sourceId: string | null;
  createdAt: string;
}>> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("xp_log")
    .select("amount, source, source_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    amount: row.amount,
    source: row.source,
    sourceId: row.source_id,
    createdAt: row.created_at,
  }));
}
