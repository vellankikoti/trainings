import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getModulesForPath } from "@/lib/content";
import { XP_REWARDS } from "@/lib/xp";
import { recalculateSkillScores } from "@/lib/skills/score-calculator";
import { evaluateBadges } from "@/lib/badges";
import { awardLessonXP, awardExerciseXP, awardModuleXP, awardPathXP } from "@/lib/xp-rewards";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type LessonProgressInsert = Database["public"]["Tables"]["lesson_progress"]["Insert"];
type ModuleProgressInsert = Database["public"]["Tables"]["module_progress"]["Insert"];
type PathProgressInsert = Database["public"]["Tables"]["path_progress"]["Insert"];

/**
 * Resolve the internal profile ID from a Clerk user ID.
 */
export async function getProfileId(clerkId: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", clerkId)
    .maybeSingle();
  return data?.id ?? null;
}

/**
 * Ensure a profile exists for the given Clerk user. If not, create one
 * just-in-time from Clerk user data. Returns the profile ID.
 *
 * This handles the case where the Clerk webhook missed creating the profile
 * (e.g., webhook wasn't configured, or the user signed up before the
 * webhook was set up).
 */
export async function ensureProfile(clerkId: string): Promise<string | null> {
  // First try the fast path — profile already exists
  const existingId = await getProfileId(clerkId);
  if (existingId) return existingId;

  // Profile doesn't exist — create one from Clerk data
  try {
    const user = await currentUser();
    if (!user || user.id !== clerkId) return null;

    const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
    const githubAccount = user.externalAccounts?.find(
      (acc) => acc.provider === "oauth_github",
    );

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        clerk_id: clerkId,
        display_name: displayName,
        avatar_url: user.imageUrl,
        username: user.username,
        github_username: githubAccount?.username || null,
      })
      .select("id")
      .single();

    if (error) {
      // Handle race condition — profile may have been created between our check and insert
      if (error.code === "23505") {
        // Unique constraint violation — profile was created concurrently
        return getProfileId(clerkId);
      }
      console.error("Failed to auto-create profile:", error);
      return null;
    }

    return data?.id ?? null;
  } catch (err) {
    console.error("ensureProfile error:", err);
    return null;
  }
}

// NOTE: Legacy awardXP() was removed — all XP awards now go through
// awardXPWithLog() in lib/xp-rewards.ts which provides dedup, logging,
// and atomic Postgres increment.

/**
 * Mark a lesson as started or completed.
 */
export async function updateLessonProgress(
  userId: string,
  pathSlug: string,
  moduleSlug: string,
  lessonSlug: string,
  status: "in_progress" | "completed",
): Promise<{
  xpAwarded: number;
  leveledUp: boolean;
  moduleProgress?: { percentage: number; completed: boolean };
}> {
  const supabase = createAdminClient();

  // Check if already exists
  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("id, status, xp_earned")
    .eq("user_id", userId)
    .eq("lesson_slug", lessonSlug)
    .eq("path_slug", pathSlug)
    .eq("module_slug", moduleSlug)
    .single();

  let xpAwarded = 0;
  let leveledUp = false;

  if (existing) {
    // Don't re-award XP if already completed
    if (existing.status === "completed" && status === "completed") {
      return { xpAwarded: 0, leveledUp: false };
    }

    const updates: Record<string, unknown> = { status };
    if (status === "completed") {
      updates.completed_at = new Date().toISOString();
      if (existing.xp_earned === 0) {
        updates.xp_earned = XP_REWARDS.LESSON_COMPLETE;
        xpAwarded = XP_REWARDS.LESSON_COMPLETE;
      }
    }

    await supabase
      .from("lesson_progress")
      .update(updates)
      .eq("id", existing.id);
  } else {
    const now = new Date().toISOString();
    const insert: LessonProgressInsert = {
      user_id: userId,
      path_slug: pathSlug,
      module_slug: moduleSlug,
      lesson_slug: lessonSlug,
      status,
      started_at: now,
      ...(status === "completed"
        ? { completed_at: now, xp_earned: XP_REWARDS.LESSON_COMPLETE }
        : {}),
    };

    if (status === "completed") {
      xpAwarded = XP_REWARDS.LESSON_COMPLETE;
    }

    await supabase.from("lesson_progress").insert(insert);
  }

  // Award XP if earned
  let moduleProgress: { percentage: number; completed: boolean } | undefined;

  if (xpAwarded > 0) {
    const result = await awardLessonXP(userId, pathSlug, moduleSlug, lessonSlug);
    leveledUp = result.leveledUp;

    // Update module progress (now returns progress data)
    moduleProgress = await recalculateModuleProgress(userId, pathSlug, moduleSlug);

    // Trigger skill score + badge evaluation
    try {
      await recalculateSkillScores(userId);
      await evaluateBadges(userId);
    } catch (err) {
      console.error("Post-lesson processing failed:", err);
    }
  }

  return { xpAwarded, leveledUp, moduleProgress };
}

/**
 * Mark an exercise as completed.
 */
export async function updateExerciseProgress(
  userId: string,
  lessonSlug: string,
  exerciseId: string,
): Promise<{ xpAwarded: number; leveledUp: boolean }> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("exercise_progress")
    .select("id, completed, attempts")
    .eq("user_id", userId)
    .eq("lesson_slug", lessonSlug)
    .eq("exercise_id", exerciseId)
    .single();

  if (existing?.completed) {
    // Already completed, just increment attempts
    await supabase
      .from("exercise_progress")
      .update({ attempts: existing.attempts + 1 })
      .eq("id", existing.id);
    return { xpAwarded: 0, leveledUp: false };
  }

  if (existing) {
    await supabase
      .from("exercise_progress")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        attempts: existing.attempts + 1,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("exercise_progress").insert({
      user_id: userId,
      lesson_slug: lessonSlug,
      exercise_id: exerciseId,
      completed: true,
      completed_at: new Date().toISOString(),
      attempts: 1,
    });
  }

  const result = await awardExerciseXP(userId, lessonSlug, exerciseId);
  return { xpAwarded: result.awarded ? result.amount : 0, leveledUp: result.leveledUp };
}

/**
 * Recalculate module progress after a lesson is completed.
 */
async function recalculateModuleProgress(
  userId: string,
  pathSlug: string,
  moduleSlug: string,
): Promise<{ percentage: number; completed: boolean }> {
  const supabase = createAdminClient();

  // Use content metadata for total lesson count (source of truth)
  const modules = getModulesForPath(pathSlug);
  const moduleMeta = modules.find((m) => m.slug === moduleSlug);
  const totalFromContent = moduleMeta?.lessonsCount ?? 0;

  // Count completed lessons from DB
  const { data: lessons } = await supabase
    .from("lesson_progress")
    .select("status")
    .eq("user_id", userId)
    .eq("path_slug", pathSlug)
    .eq("module_slug", moduleSlug);

  const completed = lessons?.filter((l) => l.status === "completed").length ?? 0;

  // SAFETY: Never use lesson_progress count as the total.
  // If content metadata is unavailable, track progress but never auto-complete.
  if (totalFromContent === 0) {
    console.warn(
      `[progress] Module ${pathSlug}/${moduleSlug}: content metadata unavailable, cannot determine total lessons. Storing partial progress only.`,
    );
    // Still record what we know, but percentage stays proportional to started lessons
    const startedCount = lessons?.length ?? 0;
    const safePercentage = startedCount > 0
      ? Math.min(Math.round((completed / startedCount) * 100), 99) // cap at 99%
      : 0;

    const { data: existing } = await supabase
      .from("module_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("path_slug", pathSlug)
      .eq("module_slug", moduleSlug)
      .single();

    const updates = {
      lessons_total: 0, // unknown
      lessons_completed: completed,
      percentage: safePercentage,
    };

    if (existing) {
      await supabase.from("module_progress").update(updates).eq("id", existing.id);
    } else {
      await supabase.from("module_progress").insert({
        user_id: userId,
        path_slug: pathSlug,
        module_slug: moduleSlug,
        started_at: new Date().toISOString(),
        ...updates,
      });
    }
    return { percentage: safePercentage, completed: false };
  }

  const total = totalFromContent;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isReallyComplete = completed >= total && total > 0;

  const { data: existing } = await supabase
    .from("module_progress")
    .select("id, completed_at")
    .eq("user_id", userId)
    .eq("path_slug", pathSlug)
    .eq("module_slug", moduleSlug)
    .single();

  // Determine completed_at value
  let completedAt: string | null | undefined;
  if (isReallyComplete && !existing?.completed_at) {
    completedAt = new Date().toISOString();
  } else if (!isReallyComplete && existing?.completed_at) {
    completedAt = null; // Clear false completion (data repair)
  }

  if (existing) {
    const updateData: Record<string, unknown> = {
      lessons_total: total,
      lessons_completed: completed,
      percentage,
    };
    if (completedAt !== undefined) {
      updateData.completed_at = completedAt;
    }
    await supabase
      .from("module_progress")
      .update(updateData)
      .eq("id", existing.id);
  } else {
    await supabase.from("module_progress").insert({
      user_id: userId,
      path_slug: pathSlug,
      module_slug: moduleSlug,
      lessons_total: total,
      lessons_completed: completed,
      percentage,
      started_at: new Date().toISOString(),
      ...(completedAt ? { completed_at: completedAt } : {}),
    });
  }

  // If module completed, award bonus XP and recalculate path
  if (isReallyComplete) {
    await awardModuleXP(userId, pathSlug, moduleSlug);
    await recalculatePathProgress(userId, pathSlug);
  }

  return { percentage, completed: isReallyComplete };
}

/**
 * Recalculate path progress after a module is completed.
 */
async function recalculatePathProgress(
  userId: string,
  pathSlug: string,
): Promise<void> {
  const supabase = createAdminClient();

  // Use content metadata for total module count (source of truth)
  const contentModules = getModulesForPath(pathSlug);
  const totalFromContent = contentModules.length;

  const { data: modules } = await supabase
    .from("module_progress")
    .select("percentage")
    .eq("user_id", userId)
    .eq("path_slug", pathSlug);

  const completed = modules?.filter((m) => m.percentage === 100).length ?? 0;

  // SAFETY: Never use module_progress count as the total.
  // If content metadata is unavailable, track progress but never auto-complete.
  if (totalFromContent === 0) {
    console.warn(
      `[progress] Path ${pathSlug}: content metadata unavailable, cannot determine total modules. Storing partial progress only.`,
    );
    const startedCount = modules?.length ?? 0;
    const safePercentage = startedCount > 0
      ? Math.min(Math.round((completed / startedCount) * 100), 99) // cap at 99%
      : 0;

    const { data: existing } = await supabase
      .from("path_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("path_slug", pathSlug)
      .single();

    const updates = {
      modules_total: 0, // unknown
      modules_completed: completed,
      percentage: safePercentage,
    };

    if (existing) {
      await supabase.from("path_progress").update(updates).eq("id", existing.id);
    } else {
      await supabase.from("path_progress").insert({
        user_id: userId,
        path_slug: pathSlug,
        started_at: new Date().toISOString(),
        ...updates,
      });
    }
    return; // Never auto-complete when content metadata is missing
  }

  const total = totalFromContent;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isReallyComplete = completed >= total && total > 0;

  const { data: existing } = await supabase
    .from("path_progress")
    .select("id, completed_at")
    .eq("user_id", userId)
    .eq("path_slug", pathSlug)
    .single();

  // Determine completed_at value
  let completedAt: string | null | undefined;
  if (isReallyComplete && !existing?.completed_at) {
    completedAt = new Date().toISOString();
  } else if (!isReallyComplete && existing?.completed_at) {
    completedAt = null; // Clear false completion (data repair)
  }

  if (existing) {
    const updateData: Record<string, unknown> = {
      modules_total: total,
      modules_completed: completed,
      percentage,
    };
    if (completedAt !== undefined) {
      updateData.completed_at = completedAt;
    }
    await supabase
      .from("path_progress")
      .update(updateData)
      .eq("id", existing.id);
  } else {
    await supabase.from("path_progress").insert({
      user_id: userId,
      path_slug: pathSlug,
      modules_total: total,
      modules_completed: completed,
      percentage,
      started_at: new Date().toISOString(),
      ...(completedAt ? { completed_at: completedAt } : {}),
    });
  }

  if (isReallyComplete) {
    await awardPathXP(userId, pathSlug);
  }
}

/**
 * Get module progress for a specific user.
 */
export async function getModuleProgress(
  userId: string,
  pathSlug: string,
  moduleSlug: string,
) {
  const supabase = createAdminClient();

  const { data: moduleProgress } = await supabase
    .from("module_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("path_slug", pathSlug)
    .eq("module_slug", moduleSlug)
    .single();

  const { data: lessonProgress } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("path_slug", pathSlug)
    .eq("module_slug", moduleSlug);

  return {
    module: moduleProgress,
    lessons: lessonProgress ?? [],
  };
}

/**
 * Get path progress for a specific user.
 */
export async function getPathProgress(userId: string, pathSlug: string) {
  const supabase = createAdminClient();

  const { data: pathProgress } = await supabase
    .from("path_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("path_slug", pathSlug)
    .single();

  const { data: moduleProgress } = await supabase
    .from("module_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("path_slug", pathSlug);

  return {
    path: pathProgress,
    modules: moduleProgress ?? [],
  };
}

/**
 * Get full dashboard data for a user.
 */
export async function getDashboardData(userId: string) {
  const supabase = createAdminClient();

  const [
    { data: profile },
    { data: pathProgress },
    { data: recentLessons },
    { data: recentActivity },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("total_xp, current_level, current_streak, longest_streak, last_activity_date")
      .eq("id", userId)
      .single(),
    supabase
      .from("path_progress")
      .select("*")
      .eq("user_id", userId),
    supabase
      .from("lesson_progress")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false, nullsFirst: false })
      .limit(5),
    supabase
      .from("daily_activity")
      .select("*")
      .eq("user_id", userId)
      .order("activity_date", { ascending: false })
      .limit(30),
  ]);

  return {
    profile,
    paths: pathProgress ?? [],
    recentLessons: recentLessons ?? [],
    recentActivity: recentActivity ?? [],
  };
}
