/**
 * Progress Reset — server-side logic for resetting course (module) or
 * path progress so a user can restart their learning from scratch.
 *
 * Key design decisions:
 * - Certificates are NOT deleted (historical proof of achievement)
 * - daily_activity records are NOT deleted (aggregate historical data)
 * - Streak data is NOT touched
 * - XP earned from the reset scope is subtracted atomically (decrement_xp RPC)
 * - xp_log entries are deleted so dedup keys are freed → user can re-earn XP
 */

import { createAdminClient } from "@/lib/supabase/server";
import { getModulesForPath } from "@/lib/content";
import { calculateLevel } from "@/lib/levels";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ResetResult {
  success: boolean;
  xpRemoved: number;
  newTotalXp: number;
  newLevel: number;
  lessonsReset: number;
  modulesReset: number;
}

// ── Module-level reset ───────────────────────────────────────────────────────

/**
 * Reset all progress for a single module (course) within a path.
 *
 * Steps:
 * 1. Sum XP from xp_log matching dedup keys for this module
 * 2. Delete lesson_progress rows for user/path/module
 * 3. Delete matching xp_log entries (frees dedup keys for re-earning)
 * 4. Delete module_progress row
 * 5. Call decrement_xp RPC (atomic, clamps at 0)
 * 6. Recalculate current_level
 * 7. Recalculate path_progress for the parent path
 */
export async function resetModuleProgress(
  userId: string,
  pathSlug: string,
  moduleSlug: string,
): Promise<ResetResult> {
  const supabase = createAdminClient();

  // 1. Sum XP from xp_log for this module's dedup keys
  //    Matches: lesson_complete:{path}/{module}/%, module_complete:{path}/{module}
  const lessonDedupPrefix = `lesson_complete:${pathSlug}/${moduleSlug}/`;
  const moduleDedupKey = `module_complete:${pathSlug}/${moduleSlug}`;

  // Query XP from lesson completions in this module
  const { data: lessonXpRows } = await supabase
    .from("xp_log")
    .select("amount, dedup_key")
    .eq("user_id", userId)
    .like("dedup_key", `${lessonDedupPrefix}%`);

  // Query XP from module completion bonus
  const { data: moduleXpRows } = await supabase
    .from("xp_log")
    .select("amount, dedup_key")
    .eq("user_id", userId)
    .eq("dedup_key", moduleDedupKey);

  const lessonXpTotal = (lessonXpRows ?? []).reduce((sum, r) => sum + r.amount, 0);
  const moduleXpTotal = (moduleXpRows ?? []).reduce((sum, r) => sum + r.amount, 0);
  const totalXpToRemove = lessonXpTotal + moduleXpTotal;

  // 2. Delete lesson_progress rows
  const { data: deletedLessons } = await supabase
    .from("lesson_progress")
    .delete()
    .eq("user_id", userId)
    .eq("path_slug", pathSlug)
    .eq("module_slug", moduleSlug)
    .select("id");

  const lessonsReset = deletedLessons?.length ?? 0;

  // 3. Delete xp_log entries (frees dedup keys)
  await supabase
    .from("xp_log")
    .delete()
    .eq("user_id", userId)
    .like("dedup_key", `${lessonDedupPrefix}%`);

  await supabase
    .from("xp_log")
    .delete()
    .eq("user_id", userId)
    .eq("dedup_key", moduleDedupKey);

  // Also delete exercise XP for lessons in this module
  // Exercise dedup keys: exercise_complete:{lessonSlug}/{exerciseId}
  // We need lesson slugs from the deleted lessons — use content metadata
  const { data: exerciseXpRows } = await supabase
    .from("xp_log")
    .select("amount, dedup_key")
    .eq("user_id", userId)
    .eq("source", "exercise_complete")
    .like("source_id", `${pathSlug}/${moduleSlug}/%`);

  // Exercise source_id format might vary — also match by dedup key pattern
  // Exercises use dedup_key: exercise_complete:{lessonSlug}/{exerciseId}
  // Since lesson slugs are not scoped to module, we'll delete exercise progress separately
  const exerciseXpTotal = (exerciseXpRows ?? []).reduce((sum, r) => sum + r.amount, 0);

  if (exerciseXpRows && exerciseXpRows.length > 0) {
    // Delete those specific xp_log entries
    const exerciseDedupKeys = exerciseXpRows.map((r) => r.dedup_key).filter(Boolean);
    if (exerciseDedupKeys.length > 0) {
      await supabase
        .from("xp_log")
        .delete()
        .eq("user_id", userId)
        .in("dedup_key", exerciseDedupKeys as string[]);
    }
  }

  // Delete exercise_progress for lessons in this module (best effort)
  try {
    await supabase
      .from("exercise_progress")
      .delete()
      .eq("user_id", userId)
      .eq("lesson_slug", moduleSlug);
  } catch {
    /* exercise_progress may not have path/module scope — ignore errors */
  }

  // 4. Delete module_progress row
  await supabase
    .from("module_progress")
    .delete()
    .eq("user_id", userId)
    .eq("path_slug", pathSlug)
    .eq("module_slug", moduleSlug);

  // 5. Subtract XP atomically
  const finalXpToRemove = totalXpToRemove + exerciseXpTotal;
  let newTotalXp = 0;

  if (finalXpToRemove > 0) {
    const { data: decrementResult } = await supabase.rpc("decrement_xp", {
      p_user_id: userId,
      p_amount: finalXpToRemove,
    });

    const row = Array.isArray(decrementResult) ? decrementResult[0] : decrementResult;
    newTotalXp = row?.new_total ?? 0;
  } else {
    // No XP to remove — fetch current total
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp")
      .eq("id", userId)
      .single();
    newTotalXp = profile?.total_xp ?? 0;
  }

  // 6. Recalculate level
  const newLevelObj = calculateLevel(newTotalXp);
  await supabase
    .from("profiles")
    .update({ current_level: newLevelObj.level })
    .eq("id", userId);

  // 7. Recalculate path progress
  await recalculatePathProgressAfterReset(userId, pathSlug);

  return {
    success: true,
    xpRemoved: finalXpToRemove,
    newTotalXp,
    newLevel: newLevelObj.level,
    lessonsReset,
    modulesReset: 1,
  };
}

// ── Path-level reset ─────────────────────────────────────────────────────────

/**
 * Reset all progress for an entire learning path (all modules within it).
 */
export async function resetPathProgress(
  userId: string,
  pathSlug: string,
): Promise<ResetResult> {
  const supabase = createAdminClient();

  // Get all modules for this path from content metadata
  const contentModules = getModulesForPath(pathSlug);
  const moduleSlugs = contentModules.map((m) => m.slug);

  // 1. Sum all XP from xp_log for this path
  //    Lesson dedup keys: lesson_complete:{path}/%
  //    Module dedup keys: module_complete:{path}/%
  //    Path dedup key: path_complete:{path}
  const { data: pathXpRows } = await supabase
    .from("xp_log")
    .select("amount, dedup_key")
    .eq("user_id", userId)
    .or(
      `dedup_key.like.lesson_complete:${pathSlug}/%,` +
      `dedup_key.like.module_complete:${pathSlug}/%,` +
      `dedup_key.eq.path_complete:${pathSlug}`,
    );

  const totalXpToRemove = (pathXpRows ?? []).reduce((sum, r) => sum + r.amount, 0);

  // 2. Delete all lesson_progress for this path
  const { data: deletedLessons } = await supabase
    .from("lesson_progress")
    .delete()
    .eq("user_id", userId)
    .eq("path_slug", pathSlug)
    .select("id");

  const lessonsReset = deletedLessons?.length ?? 0;

  // 3. Delete all xp_log entries for this path
  if (pathXpRows && pathXpRows.length > 0) {
    const dedupKeys = pathXpRows.map((r) => r.dedup_key).filter(Boolean);
    if (dedupKeys.length > 0) {
      await supabase
        .from("xp_log")
        .delete()
        .eq("user_id", userId)
        .in("dedup_key", dedupKeys as string[]);
    }
  }

  // 4. Delete all module_progress for this path
  const { data: deletedModules } = await supabase
    .from("module_progress")
    .delete()
    .eq("user_id", userId)
    .eq("path_slug", pathSlug)
    .select("id");

  const modulesReset = deletedModules?.length ?? 0;

  // 5. Delete path_progress
  await supabase
    .from("path_progress")
    .delete()
    .eq("user_id", userId)
    .eq("path_slug", pathSlug);

  // 6. Subtract XP atomically
  let newTotalXp = 0;

  if (totalXpToRemove > 0) {
    const { data: decrementResult } = await supabase.rpc("decrement_xp", {
      p_user_id: userId,
      p_amount: totalXpToRemove,
    });

    const row = Array.isArray(decrementResult) ? decrementResult[0] : decrementResult;
    newTotalXp = row?.new_total ?? 0;
  } else {
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp")
      .eq("id", userId)
      .single();
    newTotalXp = profile?.total_xp ?? 0;
  }

  // 7. Recalculate level
  const newLevelObj = calculateLevel(newTotalXp);
  await supabase
    .from("profiles")
    .update({ current_level: newLevelObj.level })
    .eq("id", userId);

  return {
    success: true,
    xpRemoved: totalXpToRemove,
    newTotalXp,
    newLevel: newLevelObj.level,
    lessonsReset,
    modulesReset,
  };
}

// ── Internal helper ──────────────────────────────────────────────────────────

/**
 * Recalculate path_progress after a module reset.
 * Mirrors the logic in progress.ts but handles the "module was deleted" case.
 */
async function recalculatePathProgressAfterReset(
  userId: string,
  pathSlug: string,
): Promise<void> {
  const supabase = createAdminClient();

  const contentModules = getModulesForPath(pathSlug);
  const totalFromContent = contentModules.length;

  // Count remaining completed modules
  const { data: modules } = await supabase
    .from("module_progress")
    .select("percentage")
    .eq("user_id", userId)
    .eq("path_slug", pathSlug);

  const completed = modules?.filter((m) => m.percentage === 100).length ?? 0;

  if (totalFromContent === 0) return;

  const percentage = Math.round((completed / totalFromContent) * 100);
  const isComplete = completed >= totalFromContent && totalFromContent > 0;

  const { data: existing } = await supabase
    .from("path_progress")
    .select("id")
    .eq("user_id", userId)
    .eq("path_slug", pathSlug)
    .single();

  if (existing) {
    await supabase
      .from("path_progress")
      .update({
        modules_completed: completed,
        modules_total: totalFromContent,
        percentage,
        // Clear completion if no longer complete
        ...(isComplete ? {} : { completed_at: null }),
      })
      .eq("id", existing.id);
  }
  // If no path_progress row exists and no modules remain, nothing to create
}
