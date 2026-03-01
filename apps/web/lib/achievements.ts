import { createAdminClient } from "@/lib/supabase/server";
import { awardXP } from "@/lib/progress";
import achievementsData from "@/data/achievements.json";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  criteria: { type: string; count: number };
}

export interface AchievementWithStatus extends Achievement {
  unlocked: boolean;
  unlockedAt: string | null;
}

const achievements = achievementsData as Achievement[];

/**
 * Check all achievements for a user and unlock any newly earned ones.
 * Returns list of newly unlocked achievements.
 */
export async function checkAchievements(
  userId: string,
): Promise<Achievement[]> {
  const supabase = createAdminClient();

  // Get already unlocked achievements
  const { data: unlocked } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const unlockedIds = new Set((unlocked ?? []).map((a) => a.achievement_id));

  // Get user stats for criteria evaluation
  const stats = await getUserStats(userId);

  const newlyUnlocked: Achievement[] = [];

  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;

    const earned = evaluateCriteria(achievement.criteria, stats);
    if (!earned) continue;

    // Unlock the achievement
    await supabase.from("user_achievements").insert({
      user_id: userId,
      achievement_id: achievement.id,
    });

    // Award XP for the achievement
    await awardXP(userId, achievement.xpReward, `achievement_${achievement.id}`);
    newlyUnlocked.push(achievement);
  }

  return newlyUnlocked;
}

/**
 * Get all achievements with unlock status for a user.
 */
export async function getAllAchievements(
  userId: string,
): Promise<AchievementWithStatus[]> {
  const supabase = createAdminClient();

  const { data: unlocked } = await supabase
    .from("user_achievements")
    .select("achievement_id, unlocked_at")
    .eq("user_id", userId);

  const unlockedMap = new Map(
    (unlocked ?? []).map((a) => [a.achievement_id, a.unlocked_at]),
  );

  return achievements.map((a) => ({
    ...a,
    unlocked: unlockedMap.has(a.id),
    unlockedAt: unlockedMap.get(a.id) ?? null,
  }));
}

interface UserStats {
  lessonsCompleted: number;
  exercisesCompleted: number;
  modulesCompleted: number;
  pathsCompleted: number;
  projectsCompleted: number;
  perfectQuizzes: number;
  longestStreak: number;
}

async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = createAdminClient();

  const [
    { count: lessonsCompleted },
    { count: exercisesCompleted },
    { count: modulesCompleted },
    { count: pathsCompleted },
    { count: projectsCompleted },
    { count: perfectQuizzes },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("lesson_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed"),
    supabase
      .from("exercise_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true),
    supabase
      .from("module_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("percentage", 100),
    supabase
      .from("path_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("percentage", 100),
    supabase
      .from("project_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed"),
    supabase
      .from("quiz_attempts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("score", 100),
    supabase
      .from("profiles")
      .select("longest_streak")
      .eq("id", userId)
      .single(),
  ]);

  return {
    lessonsCompleted: lessonsCompleted ?? 0,
    exercisesCompleted: exercisesCompleted ?? 0,
    modulesCompleted: modulesCompleted ?? 0,
    pathsCompleted: pathsCompleted ?? 0,
    projectsCompleted: projectsCompleted ?? 0,
    perfectQuizzes: perfectQuizzes ?? 0,
    longestStreak: profile?.longest_streak ?? 0,
  };
}

function evaluateCriteria(
  criteria: { type: string; count: number },
  stats: UserStats,
): boolean {
  switch (criteria.type) {
    case "lessons_completed":
      return stats.lessonsCompleted >= criteria.count;
    case "exercises_completed":
      return stats.exercisesCompleted >= criteria.count;
    case "modules_completed":
      return stats.modulesCompleted >= criteria.count;
    case "paths_completed":
      return stats.pathsCompleted >= criteria.count;
    case "projects_completed":
      return stats.projectsCompleted >= criteria.count;
    case "perfect_quiz":
      return stats.perfectQuizzes >= criteria.count;
    case "streak":
      return stats.longestStreak >= criteria.count;
    default:
      return false;
  }
}
