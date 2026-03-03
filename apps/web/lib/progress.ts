import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import { XP_REWARDS } from "@/lib/xp";
import { calculateLevel } from "@/lib/levels";
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
    .single();
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

/**
 * Award XP to a user and handle level-up detection.
 */
export async function awardXP(
  userId: string,
  amount: number,
  source: string,
): Promise<{ newTotal: number; leveledUp: boolean; newLevel: number }> {
  const supabase = createAdminClient();

  // Get current XP
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_xp, current_level")
    .eq("id", userId)
    .single();

  if (!profile) throw new Error("Profile not found");

  const oldLevel = profile.current_level;
  const newTotal = profile.total_xp + amount;
  const newLevelObj = calculateLevel(newTotal);

  await supabase
    .from("profiles")
    .update({
      total_xp: newTotal,
      current_level: newLevelObj.level,
    })
    .eq("id", userId);

  return {
    newTotal,
    leveledUp: newLevelObj.level > oldLevel,
    newLevel: newLevelObj.level,
  };
}

/**
 * Mark a lesson as started or completed.
 */
export async function updateLessonProgress(
  userId: string,
  pathSlug: string,
  moduleSlug: string,
  lessonSlug: string,
  status: "in_progress" | "completed",
): Promise<{ xpAwarded: number; leveledUp: boolean }> {
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
  if (xpAwarded > 0) {
    const result = await awardXP(userId, xpAwarded, "lesson_complete");
    leveledUp = result.leveledUp;

    // Update module progress
    await recalculateModuleProgress(userId, pathSlug, moduleSlug);
  }

  return { xpAwarded, leveledUp };
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

  const result = await awardXP(userId, XP_REWARDS.EXERCISE_COMPLETE, "exercise_complete");
  return { xpAwarded: XP_REWARDS.EXERCISE_COMPLETE, leveledUp: result.leveledUp };
}

/**
 * Recalculate module progress after a lesson is completed.
 */
async function recalculateModuleProgress(
  userId: string,
  pathSlug: string,
  moduleSlug: string,
): Promise<void> {
  const supabase = createAdminClient();

  // Count total and completed lessons for this module
  const { data: lessons } = await supabase
    .from("lesson_progress")
    .select("status")
    .eq("user_id", userId)
    .eq("path_slug", pathSlug)
    .eq("module_slug", moduleSlug);

  const total = lessons?.length ?? 0;
  const completed = lessons?.filter((l) => l.status === "completed").length ?? 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const { data: existing } = await supabase
    .from("module_progress")
    .select("id")
    .eq("user_id", userId)
    .eq("path_slug", pathSlug)
    .eq("module_slug", moduleSlug)
    .single();

  const updates = {
    lessons_total: total,
    lessons_completed: completed,
    percentage,
    ...(percentage === 100
      ? { completed_at: new Date().toISOString() }
      : {}),
  };

  if (existing) {
    await supabase
      .from("module_progress")
      .update(updates)
      .eq("id", existing.id);
  } else {
    await supabase.from("module_progress").insert({
      user_id: userId,
      path_slug: pathSlug,
      module_slug: moduleSlug,
      started_at: new Date().toISOString(),
      ...updates,
    });
  }

  // If module completed, award bonus XP and recalculate path
  if (percentage === 100) {
    await awardXP(userId, XP_REWARDS.MODULE_COMPLETE, "module_complete");
    await recalculatePathProgress(userId, pathSlug);
  }
}

/**
 * Recalculate path progress after a module is completed.
 */
async function recalculatePathProgress(
  userId: string,
  pathSlug: string,
): Promise<void> {
  const supabase = createAdminClient();

  const { data: modules } = await supabase
    .from("module_progress")
    .select("percentage")
    .eq("user_id", userId)
    .eq("path_slug", pathSlug);

  const total = modules?.length ?? 0;
  const completed = modules?.filter((m) => m.percentage === 100).length ?? 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const { data: existing } = await supabase
    .from("path_progress")
    .select("id")
    .eq("user_id", userId)
    .eq("path_slug", pathSlug)
    .single();

  const updates = {
    modules_total: total,
    modules_completed: completed,
    percentage,
    ...(percentage === 100
      ? { completed_at: new Date().toISOString() }
      : {}),
  };

  if (existing) {
    await supabase
      .from("path_progress")
      .update(updates)
      .eq("id", existing.id);
  } else {
    await supabase.from("path_progress").insert({
      user_id: userId,
      path_slug: pathSlug,
      started_at: new Date().toISOString(),
      ...updates,
    });
  }

  if (percentage === 100) {
    await awardXP(userId, XP_REWARDS.PATH_COMPLETE, "path_complete");
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
