import { createAdminClient } from "@/lib/supabase/server";
import { getAllPaths, getModulesForPath, type PathMeta } from "@/lib/content";
import { getAssessment } from "@/lib/quiz";
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

export interface SkillScoreSummary {
  domain: string;
  compositeScore: number;
  percentile: number | null;
  theoryScore: number;
  labScore: number;
  quizScore: number;
}

export interface ActivityDay {
  date: string;
  xpEarned: number;
  lessonsCompleted: number;
  timeSpentSeconds: number;
}

export interface DashboardStats {
  level: number;
  levelTitle: string;
  levelProgress: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  totalLessonsCompleted: number;
  role: string;
}

export interface RecommendedAction {
  type: "lesson" | "quiz" | "path";
  title: string;
  subtitle: string;
  href: string;
  reason: string;
}

export interface DashboardData {
  stats: DashboardStats;
  resumeTarget: ResumeTarget | null;
  recommendedNext: RecommendedAction[];
  activeCourses: ActiveCourse[];
  completedCourses: CompletedCourse[];
  pathProgress: PathProgressSummary[];
  skillScores: SkillScoreSummary[];
  activityHeatmap: ActivityDay[];
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

  // Calculate date range for activity heatmap (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const heatmapStartDate = ninetyDaysAgo.toISOString().split("T")[0];

  // Parallel: fetch all DB data + content metadata
  const [
    { data: profile },
    { data: allLessonProgress },
    { data: allModuleProgress },
    { data: allPathProgress },
    { data: skillScoresData },
    { data: activityData },
    { data: passedQuizzes },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "total_xp, current_streak, longest_streak, role",
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
    supabase
      .from("skill_scores")
      .select("domain, composite_score, percentile, theory_score, lab_score, quiz_score")
      .eq("user_id", profileId)
      .order("composite_score", { ascending: false }),
    supabase
      .from("daily_activity")
      .select("activity_date, xp_earned, lessons_completed, time_spent_seconds")
      .eq("user_id", profileId)
      .gte("activity_date", heatmapStartDate)
      .order("activity_date", { ascending: true }),
    supabase
      .from("quiz_attempts")
      .select("quiz_id, module_slug, passed")
      .eq("user_id", profileId)
      .eq("passed", true),
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
    longestStreak: profile?.longest_streak ?? 0,
    totalLessonsCompleted: completedLessonsCount,
    role: profile?.role ?? "learner",
  };

  // ─── Resume Target ─────────────────────────────────────────────────────
  // Strategy: Find the most recently accessed lesson that is NOT completed,
  // or find the next lesson after the most recently completed one.
  const resumeTarget = computeResumeTarget(lessons, allPaths);

  // Enrich resume target with actual course progress
  if (resumeTarget) {
    const modProg = modulesProg.find(
      (m) =>
        m.path_slug === resumeTarget.pathSlug &&
        m.module_slug === resumeTarget.moduleSlug,
    );
    if (modProg) {
      resumeTarget.courseProgress = modProg.percentage;
    } else {
      // Compute from lesson data if no module_progress row yet
      const modules = getModulesForPath(resumeTarget.pathSlug);
      const moduleMeta = modules.find((m) => m.slug === resumeTarget.moduleSlug);
      if (moduleMeta && moduleMeta.lessonsCount > 0) {
        const completedInModule = lessons.filter(
          (l) =>
            l.path_slug === resumeTarget.pathSlug &&
            l.module_slug === resumeTarget.moduleSlug &&
            l.status === "completed",
        ).length;
        resumeTarget.courseProgress = Math.round(
          (completedInModule / moduleMeta.lessonsCount) * 100,
        );
      }
    }
  }

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

  // ─── Skill Scores ───────────────────────────────────────────────────────
  const skillScores: SkillScoreSummary[] = (skillScoresData ?? []).map((s) => ({
    domain: s.domain,
    compositeScore: s.composite_score,
    percentile: s.percentile,
    theoryScore: s.theory_score,
    labScore: s.lab_score,
    quizScore: s.quiz_score,
  }));

  // ─── Activity Heatmap ─────────────────────────────────────────────────
  const activityHeatmap: ActivityDay[] = (activityData ?? []).map((a) => ({
    date: a.activity_date,
    xpEarned: a.xp_earned,
    lessonsCompleted: a.lessons_completed,
    timeSpentSeconds: a.time_spent_seconds,
  }));

  // ─── Recommended Next Actions ────────────────────────────────────────
  const passedQuizModules = new Set(
    (passedQuizzes ?? [])
      .map((q) => q.module_slug)
      .filter((s): s is string => s != null),
  );
  const recommendedNext = computeRecommendedNext(
    lessons,
    pathsProg,
    allPaths,
    activeCourses,
    passedQuizModules,
  );

  return {
    stats,
    resumeTarget,
    recommendedNext,
    activeCourses,
    completedCourses,
    pathProgress,
    skillScores,
    activityHeatmap,
  };
}

// ─── Recommendation Logic ────────────────────────────────────────────────────

/** Path prerequisite order for recommendations */
const PATH_ORDER = [
  "foundations",
  "containerization",
  "cicd-gitops",
  "iac-cloud",
  "observability",
  "platform-engineering",
];

function computeRecommendedNext(
  lessons: Array<{
    lesson_slug: string;
    path_slug: string;
    module_slug: string;
    status: string;
  }>,
  pathsProg: Array<{
    path_slug: string;
    percentage: number;
    modules_total: number;
    modules_completed: number;
  }>,
  allPaths: PathMeta[],
  activeCourses: ActiveCourse[],
  passedQuizModules: Set<string>,
): RecommendedAction[] {
  const actions: RecommendedAction[] = [];

  const completedPathSlugs = new Set(
    pathsProg.filter((p) => p.percentage === 100).map((p) => p.path_slug),
  );
  const startedPathSlugs = new Set(
    pathsProg.map((p) => p.path_slug),
  );

  // 1. Suggest continuing highest-priority active course
  if (activeCourses.length > 0) {
    const top = activeCourses[0]; // already sorted by most recently accessed
    actions.push({
      type: "lesson",
      title: top.moduleTitle,
      subtitle: `${top.completedLessons}/${top.totalLessons} lessons · ${top.progress}%`,
      href: `/learn/${top.pathSlug}/${top.moduleSlug}/${top.resumeLessonSlug}`,
      reason: "Continue where you left off",
    });
  }

  // 2. Suggest module quiz if all lessons completed but quiz not passed
  for (const pp of pathsProg) {
    if (pp.percentage === 100) continue;

    const modules = getModulesForPath(pp.path_slug);
    for (const mod of modules) {
      // Check if all lessons in this module are completed
      const moduleLessons = lessons.filter(
        (l) => l.path_slug === pp.path_slug && l.module_slug === mod.slug,
      );
      const completedInModule = moduleLessons.filter(
        (l) => l.status === "completed",
      ).length;

      if (completedInModule >= mod.lessonsCount && mod.lessonsCount > 0) {
        // All lessons done — check if quiz exists and hasn't been passed
        if (!passedQuizModules.has(mod.slug)) {
          const assessment = getAssessment(pp.path_slug, mod.slug);
          if (assessment) {
            actions.push({
              type: "quiz",
              title: `${mod.title} Quiz`,
              subtitle: `${assessment.questions.length} questions · ${assessment.passingScore}% to pass`,
              href: `/quiz/${assessment.id}`,
              reason: "All lessons complete — test your knowledge",
            });
            break; // Only suggest one quiz
          }
        }
      }
    }
    if (actions.some((a) => a.type === "quiz")) break;
  }

  // 3. Suggest next path in the learning sequence
  for (const pathSlug of PATH_ORDER) {
    if (completedPathSlugs.has(pathSlug) || startedPathSlugs.has(pathSlug)) {
      continue;
    }

    const pathMeta = allPaths.find((p) => p.slug === pathSlug);
    if (!pathMeta) continue;

    // Only suggest if prerequisites are met (previous path completed or it's foundations)
    const pathIndex = PATH_ORDER.indexOf(pathSlug);
    const prereqMet =
      pathIndex === 0 ||
      completedPathSlugs.has(PATH_ORDER[pathIndex - 1]);

    if (prereqMet) {
      actions.push({
        type: "path",
        title: pathMeta.title,
        subtitle: `${pathMeta.difficulty} · ${pathMeta.estimatedHours}h estimated`,
        href: `/paths/${pathMeta.slug}`,
        reason:
          pathIndex === 0
            ? "Recommended starting path"
            : `Next step after completing ${PATH_ORDER[pathIndex - 1]}`,
      });
      break; // Only suggest one new path
    }
  }

  // 4. Suggest a new module within an active path
  for (const pp of pathsProg) {
    if (pp.percentage === 100) continue;

    const modules = getModulesForPath(pp.path_slug);

    // Find a module with no lesson progress yet
    for (const mod of modules) {
      const hasProgress = lessons.some(
        (l) =>
          l.path_slug === pp.path_slug &&
          l.module_slug === mod.slug,
      );
      if (hasProgress) continue;

      const pathMeta = allPaths.find((p) => p.slug === pp.path_slug);
      if (!pathMeta || mod.lessons.length === 0) continue;

      actions.push({
        type: "lesson",
        title: mod.title,
        subtitle: `${mod.lessonsCount} lessons · ${mod.estimatedHours}h`,
        href: `/learn/${pp.path_slug}/${mod.slug}/${mod.lessons[0].slug}`,
        reason: `New course in ${pathMeta.title}`,
      });
      break; // Only suggest one new module per path
    }
  }

  // Limit to 3 recommendations
  return actions.slice(0, 3);
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
