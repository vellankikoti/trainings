import { createAdminClient } from "@/lib/supabase/server";
import { getAllPaths, getModulesForPath, type PathMeta } from "@/lib/content";
import { calculateLevel, levelProgress } from "@/lib/levels";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ResumeTarget {
  pathSlug: string;
  pathTitle: string;
  moduleSlug: string;
  moduleTitle: string;
  lessonSlug: string;
  lessonTitle: string;
  courseProgress: number;
}

export interface ActiveCourse {
  pathSlug: string;
  pathTitle: string;
  moduleSlug: string;
  moduleTitle: string;
  difficulty: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessedAt: string | null;
  /** The lesson slug to resume from (first incomplete lesson) */
  resumeLessonSlug: string;
}

export interface CompletedCourse {
  pathSlug: string;
  moduleSlug: string;
  moduleTitle: string;
  completedAt: string | null;
}

export interface PathProgressSummary {
  slug: string;
  title: string;
  progress: number;
  coursesCompleted: number;
  coursesTotal: number;
  color: string;
}

export interface DashboardStats {
  level: number;
  levelTitle: string;
  levelProgress: number;
  totalXp: number;
  currentStreak: number;
  totalLessonsCompleted: number;
}

export interface DashboardData {
  stats: DashboardStats;
  resumeTarget: ResumeTarget | null;
  activeCourses: ActiveCourse[];
  completedCourses: CompletedCourse[];
  pathProgress: PathProgressSummary[];
}

// ─── Main Function ───────────────────────────────────────────────────────────

/**
 * Fetch all data needed for the dashboard in a single server-side call.
 * Combines DB progress data with file-system content metadata.
 */
export async function getFullDashboardData(
  profileId: string,
): Promise<DashboardData> {
  const supabase = createAdminClient();

  // Parallel: fetch all DB data + content metadata
  const [
    { data: profile },
    { data: allLessonProgress },
    { data: allModuleProgress },
    { data: allPathProgress },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "total_xp, current_level, current_streak, longest_streak",
      )
      .eq("id", profileId)
      .single(),
    supabase
      .from("lesson_progress")
      .select("lesson_slug, path_slug, module_slug, status, started_at, completed_at")
      .eq("user_id", profileId)
      .order("started_at", { ascending: false, nullsFirst: false }),
    supabase
      .from("module_progress")
      .select("path_slug, module_slug, percentage, completed_at")
      .eq("user_id", profileId),
    supabase
      .from("path_progress")
      .select("path_slug, percentage, modules_total, modules_completed")
      .eq("user_id", profileId),
  ]);

  const lessons = allLessonProgress ?? [];
  const modulesProg = allModuleProgress ?? [];
  const pathsProg = allPathProgress ?? [];

  // Content metadata (file system, synchronous)
  const allPaths = getAllPaths();

  // ─── Stats ─────────────────────────────────────────────────────────────
  const totalXp = profile?.total_xp ?? 0;
  const levelObj = calculateLevel(totalXp);
  const lvlProgress = levelProgress(totalXp);
  const completedLessonsCount = lessons.filter(
    (l) => l.status === "completed",
  ).length;

  const stats: DashboardStats = {
    level: levelObj.level,
    levelTitle: levelObj.title,
    levelProgress: lvlProgress,
    totalXp,
    currentStreak: profile?.current_streak ?? 0,
    totalLessonsCompleted: completedLessonsCount,
  };

  // ─── Resume Target ─────────────────────────────────────────────────────
  // Strategy: Find the most recently accessed lesson that is NOT completed,
  // or find the next lesson after the most recently completed one.
  const resumeTarget = computeResumeTarget(lessons, allPaths);

  // ─── Active & Completed Courses ────────────────────────────────────────
  const activeCourses: ActiveCourse[] = [];
  const completedCourses: CompletedCourse[] = [];

  for (const modProg of modulesProg) {
    const pathMeta = allPaths.find((p) => p.slug === modProg.path_slug);
    if (!pathMeta) continue;

    const modules = getModulesForPath(modProg.path_slug);
    const moduleMeta = modules.find((m) => m.slug === modProg.module_slug);
    if (!moduleMeta) continue;

    if (modProg.percentage === 100 && modProg.completed_at) {
      completedCourses.push({
        pathSlug: modProg.path_slug,
        moduleSlug: modProg.module_slug,
        moduleTitle: moduleMeta.title,
        completedAt: modProg.completed_at,
      });
    } else {
      // Find the most recent lesson activity for this module
      const moduleLessons = lessons.filter(
        (l) =>
          l.path_slug === modProg.path_slug &&
          l.module_slug === modProg.module_slug,
      );
      const lastAccessed =
        moduleLessons[0]?.started_at ?? null;

      const completedSlugs = new Set(
        moduleLessons.filter((l) => l.status === "completed").map((l) => l.lesson_slug),
      );
      const resumeLesson = moduleMeta.lessons.find(
        (l) => !completedSlugs.has(l.slug),
      );

      activeCourses.push({
        pathSlug: modProg.path_slug,
        pathTitle: pathMeta.title,
        moduleSlug: modProg.module_slug,
        moduleTitle: moduleMeta.title,
        difficulty: pathMeta.difficulty,
        progress: modProg.percentage,
        totalLessons: moduleMeta.lessonsCount,
        completedLessons: completedSlugs.size,
        lastAccessedAt: lastAccessed,
        resumeLessonSlug: resumeLesson?.slug ?? moduleMeta.lessons[0]?.slug ?? "",
      });
    }
  }

  // Also detect modules where the user has lesson progress but no module_progress row yet
  // (e.g., started a lesson but module_progress wasn't created)
  const trackedModules = new Set(
    modulesProg.map((m) => `${m.path_slug}/${m.module_slug}`),
  );

  const untrackedModules = new Map<string, typeof lessons>();
  for (const lesson of lessons) {
    const key = `${lesson.path_slug}/${lesson.module_slug}`;
    if (trackedModules.has(key)) continue;
    if (!untrackedModules.has(key)) {
      untrackedModules.set(key, []);
    }
    untrackedModules.get(key)!.push(lesson);
  }

  for (const [key, moduleLessons] of untrackedModules) {
    const [pathSlug, moduleSlug] = key.split("/");
    const pathMeta = allPaths.find((p) => p.slug === pathSlug);
    if (!pathMeta) continue;

    const modules = getModulesForPath(pathSlug);
    const moduleMeta = modules.find((m) => m.slug === moduleSlug);
    if (!moduleMeta) continue;

    const completedSlugsInModule = new Set(
      moduleLessons.filter((l) => l.status === "completed").map((l) => l.lesson_slug),
    );
    const completedInModule = completedSlugsInModule.size;
    const progress =
      moduleMeta.lessonsCount > 0
        ? Math.round((completedInModule / moduleMeta.lessonsCount) * 100)
        : 0;
    const resumeLesson = moduleMeta.lessons.find(
      (l) => !completedSlugsInModule.has(l.slug),
    );

    activeCourses.push({
      pathSlug,
      pathTitle: pathMeta.title,
      moduleSlug,
      moduleTitle: moduleMeta.title,
      difficulty: pathMeta.difficulty,
      progress,
      totalLessons: moduleMeta.lessonsCount,
      completedLessons: completedInModule,
      lastAccessedAt: moduleLessons[0]?.started_at ?? null,
      resumeLessonSlug: resumeLesson?.slug ?? moduleMeta.lessons[0]?.slug ?? "",
    });
  }

  // Sort active courses by last accessed (most recent first)
  activeCourses.sort((a, b) => {
    if (!a.lastAccessedAt) return 1;
    if (!b.lastAccessedAt) return -1;
    return (
      new Date(b.lastAccessedAt).getTime() -
      new Date(a.lastAccessedAt).getTime()
    );
  });

  // ─── Path Progress ─────────────────────────────────────────────────────
  const pathProgress: PathProgressSummary[] = [];
  for (const pp of pathsProg) {
    const pathMeta = allPaths.find((p) => p.slug === pp.path_slug);
    if (!pathMeta) continue;

    pathProgress.push({
      slug: pp.path_slug,
      title: pathMeta.title,
      progress: pp.percentage,
      coursesCompleted: pp.modules_completed,
      coursesTotal: pp.modules_total,
      color: pathMeta.color,
    });
  }

  return {
    stats,
    resumeTarget,
    activeCourses,
    completedCourses,
    pathProgress,
  };
}

// ─── Resume Logic ────────────────────────────────────────────────────────────

function computeResumeTarget(
  lessons: Array<{
    lesson_slug: string;
    path_slug: string;
    module_slug: string;
    status: string;
    started_at: string | null;
    completed_at: string | null;
  }>,
  allPaths: PathMeta[],
): ResumeTarget | null {
  if (lessons.length === 0) return null;

  // 1. Find the most recently started in-progress lesson
  const inProgress = lessons.find((l) => l.status === "in_progress");
  if (inProgress) {
    return buildResumeTarget(inProgress, allPaths);
  }

  // 2. Find the next lesson after the most recently completed one
  const lastCompleted = lessons.find((l) => l.status === "completed");
  if (!lastCompleted) return null;

  const modules = getModulesForPath(lastCompleted.path_slug);
  const moduleMeta = modules.find(
    (m) => m.slug === lastCompleted.module_slug,
  );
  if (!moduleMeta) return null;

  const lessonIndex = moduleMeta.lessons.findIndex(
    (l) => l.slug === lastCompleted.lesson_slug,
  );

  // Next lesson in same module
  if (lessonIndex >= 0 && lessonIndex < moduleMeta.lessons.length - 1) {
    const nextLesson = moduleMeta.lessons[lessonIndex + 1];
    return buildResumeTargetFromMeta(
      lastCompleted.path_slug,
      lastCompleted.module_slug,
      nextLesson.slug,
      nextLesson.title,
      allPaths,
      modules,
    );
  }

  // First lesson of next module in same path
  const moduleIndex = modules.findIndex(
    (m) => m.slug === lastCompleted.module_slug,
  );
  if (moduleIndex >= 0 && moduleIndex < modules.length - 1) {
    const nextModule = modules[moduleIndex + 1];
    if (nextModule.lessons.length > 0) {
      const firstLesson = nextModule.lessons[0];
      return buildResumeTargetFromMeta(
        lastCompleted.path_slug,
        nextModule.slug,
        firstLesson.slug,
        firstLesson.title,
        allPaths,
        modules,
      );
    }
  }

  // Course is complete — return null (dashboard will show congratulations)
  return null;
}

function buildResumeTarget(
  lesson: {
    path_slug: string;
    module_slug: string;
    lesson_slug: string;
  },
  allPaths: PathMeta[],
): ResumeTarget | null {
  const pathMeta = allPaths.find((p) => p.slug === lesson.path_slug);
  if (!pathMeta) return null;

  const modules = getModulesForPath(lesson.path_slug);
  const moduleMeta = modules.find((m) => m.slug === lesson.module_slug);
  if (!moduleMeta) return null;

  const lessonMeta = moduleMeta.lessons.find(
    (l) => l.slug === lesson.lesson_slug,
  );
  if (!lessonMeta) return null;

  return {
    pathSlug: lesson.path_slug,
    pathTitle: pathMeta.title,
    moduleSlug: lesson.module_slug,
    moduleTitle: moduleMeta.title,
    lessonSlug: lesson.lesson_slug,
    lessonTitle: lessonMeta.title,
    courseProgress: 0, // Will be enriched by caller if needed
  };
}

function buildResumeTargetFromMeta(
  pathSlug: string,
  moduleSlug: string,
  lessonSlug: string,
  lessonTitle: string,
  allPaths: PathMeta[],
  modules: ReturnType<typeof getModulesForPath>,
): ResumeTarget | null {
  const pathMeta = allPaths.find((p) => p.slug === pathSlug);
  if (!pathMeta) return null;

  const moduleMeta = modules.find((m) => m.slug === moduleSlug);
  if (!moduleMeta) return null;

  return {
    pathSlug,
    pathTitle: pathMeta.title,
    moduleSlug,
    moduleTitle: moduleMeta.title,
    lessonSlug,
    lessonTitle,
    courseProgress: 0,
  };
}
