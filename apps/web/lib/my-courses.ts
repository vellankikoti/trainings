import { createAdminClient } from "@/lib/supabase/server";
import { getAllPaths, getModulesForPath, type PathMeta } from "@/lib/content";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MyCourse {
  slug: string;
  pathSlug: string;
  pathTitle: string;
  pathColor: string;
  title: string;
  description: string;
  difficulty: string;
  lessonsCount: number;
  estimatedHours: number;
  completedLessons: number;
  /** 0-100 */
  progress: number;
  status: "in_progress" | "completed" | "not_started";
  resumeLessonSlug: string | null;
  completedAt: string | null;
  lastAccessedAt: string | null;
}

export interface MyCoursesData {
  /** In progress, sorted by lastAccessed DESC */
  activeCourses: MyCourse[];
  /** Completed, sorted by completedAt DESC */
  completedCourses: MyCourse[];
  /** Not started but in user's active path */
  upNextCourses: MyCourse[];
  /** All other courses not yet started */
  exploreCourses: MyCourse[];
  /** The active path title (for section subtitles) */
  activePathTitle: string | null;
}

// ─── Main Function ───────────────────────────────────────────────────────────

/**
 * Fetch all data needed for the My Courses page.
 * Combines DB progress with file-system content metadata.
 */
export async function getMyCoursesData(
  profileId: string,
): Promise<MyCoursesData> {
  const supabase = createAdminClient();

  // Parallel: fetch lesson + module progress from DB
  const [{ data: allLessonProgress }, { data: allModuleProgress }] =
    await Promise.all([
      supabase
        .from("lesson_progress")
        .select(
          "lesson_slug, path_slug, module_slug, status, started_at, completed_at",
        )
        .eq("user_id", profileId)
        .order("started_at", { ascending: false, nullsFirst: false }),
      supabase
        .from("module_progress")
        .select("path_slug, module_slug, percentage, completed_at")
        .eq("user_id", profileId),
    ]);

  const lessons = allLessonProgress ?? [];
  const modulesProg = allModuleProgress ?? [];

  // Content metadata (file system)
  const allPaths = getAllPaths();

  // Build lookup maps for fast access
  const moduleProgressMap = new Map<
    string,
    { percentage: number; completed_at: string | null }
  >();
  for (const mp of modulesProg) {
    moduleProgressMap.set(`${mp.path_slug}/${mp.module_slug}`, {
      percentage: mp.percentage,
      completed_at: mp.completed_at,
    });
  }

  // Group lessons by module for progress + resume computation
  const lessonsByModule = new Map<
    string,
    Array<{
      lesson_slug: string;
      status: string;
      started_at: string | null;
      completed_at: string | null;
    }>
  >();
  for (const l of lessons) {
    const key = `${l.path_slug}/${l.module_slug}`;
    if (!lessonsByModule.has(key)) {
      lessonsByModule.set(key, []);
    }
    lessonsByModule.get(key)!.push(l);
  }

  // ─── Classify all courses ────────────────────────────────────────────────
  const activeCourses: MyCourse[] = [];
  const completedCourses: MyCourse[] = [];
  const notStartedCourses: MyCourse[] = [];

  // Track which path has most recent activity (for "up next" section)
  let activePathSlug: string | null = null;
  let latestActivityDate: Date | null = null;

  for (const pathMeta of allPaths) {
    const modules = getModulesForPath(pathMeta.slug);

    for (const mod of modules) {
      const key = `${pathMeta.slug}/${mod.slug}`;
      const modProg = moduleProgressMap.get(key);
      const modLessons = lessonsByModule.get(key) ?? [];

      const completedSlugs = new Set(
        modLessons
          .filter((l) => l.status === "completed")
          .map((l) => l.lesson_slug),
      );
      const completedLessons = completedSlugs.size;

      // Determine progress — always compute from actual lesson data
      // (more reliable than stored DB percentage which can be stale/incorrect)
      let progress = 0;
      if (mod.lessonsCount > 0 && completedLessons > 0) {
        progress = Math.round((completedLessons / mod.lessonsCount) * 100);
      } else if (modProg) {
        // Fallback to DB percentage only if we have no lesson data
        progress = modProg.percentage;
      }

      // Find resume lesson (first incomplete)
      const resumeLesson = mod.lessons.find(
        (l) => !completedSlugs.has(l.slug),
      );

      // Determine last accessed time
      const lastAccessedAt = modLessons[0]?.started_at ?? null;

      // Track latest activity for active path detection
      if (lastAccessedAt) {
        const activityDate = new Date(lastAccessedAt);
        if (!latestActivityDate || activityDate > latestActivityDate) {
          latestActivityDate = activityDate;
          activePathSlug = pathMeta.slug;
        }
      }

      const baseCourse: MyCourse = {
        slug: mod.slug,
        pathSlug: pathMeta.slug,
        pathTitle: pathMeta.title,
        pathColor: pathMeta.color,
        title: mod.title,
        description: mod.description,
        difficulty: pathMeta.difficulty,
        lessonsCount: mod.lessonsCount,
        estimatedHours: mod.estimatedHours,
        completedLessons,
        progress,
        status: "not_started",
        resumeLessonSlug: resumeLesson?.slug ?? mod.lessons[0]?.slug ?? null,
        completedAt: null,
        lastAccessedAt,
      };

      // Classify
      if (progress === 100 && (modProg?.completed_at || completedLessons >= mod.lessonsCount)) {
        completedCourses.push({
          ...baseCourse,
          status: "completed",
          completedAt: modProg?.completed_at ?? null,
        });
      } else if (progress > 0 || modLessons.length > 0) {
        activeCourses.push({
          ...baseCourse,
          status: "in_progress",
        });
      } else {
        notStartedCourses.push(baseCourse);
      }
    }
  }

  // ─── Sort results ────────────────────────────────────────────────────────
  activeCourses.sort((a, b) => {
    if (!a.lastAccessedAt) return 1;
    if (!b.lastAccessedAt) return -1;
    return (
      new Date(b.lastAccessedAt).getTime() -
      new Date(a.lastAccessedAt).getTime()
    );
  });

  completedCourses.sort((a, b) => {
    if (!a.completedAt) return 1;
    if (!b.completedAt) return -1;
    return (
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  });

  // ─── Split not-started into "up next" vs "explore" ───────────────────────
  // "Up Next" = not-started courses from the user's active path
  // "Explore" = everything else
  const upNextCourses: MyCourse[] = [];
  const exploreCourses: MyCourse[] = [];

  for (const course of notStartedCourses) {
    if (activePathSlug && course.pathSlug === activePathSlug) {
      upNextCourses.push(course);
    } else {
      exploreCourses.push(course);
    }
  }

  // Find active path title
  const activePathTitle = activePathSlug
    ? (allPaths.find((p) => p.slug === activePathSlug)?.title ?? null)
    : null;

  return {
    activeCourses,
    completedCourses,
    upNextCourses,
    exploreCourses,
    activePathTitle,
  };
}
