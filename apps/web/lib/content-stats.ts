import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface PathStats {
  slug: string;
  title: string;
  moduleCount: number;
  lessonCount: number;
  totalWords: number;
  totalEstimatedMinutes: number;
  modules: ModuleStats[];
}

export interface ModuleStats {
  slug: string;
  title: string;
  lessonCount: number;
  totalWords: number;
  lessons: LessonStats[];
}

export interface LessonStats {
  slug: string;
  title: string;
  wordCount: number;
  estimatedMinutes: number;
  xpReward: number;
  hasQuiz: boolean;
  hasExercises: boolean;
  exerciseCount: number;
  objectiveCount: number;
}

export interface PlatformStats {
  totalPaths: number;
  totalModules: number;
  totalLessons: number;
  totalWords: number;
  totalEstimatedMinutes: number;
  totalQuizzes: number;
  totalQuizQuestions: number;
  totalExercises: number;
  paths: PathStats[];
  contentGaps: string[];
}

const CONTENT_ROOT = path.join(process.cwd(), "..", "..", "content");

export function getFullContentStats(): PlatformStats {
  const pathsDir = path.join(CONTENT_ROOT, "paths");
  const quizzesDir = path.join(CONTENT_ROOT, "quizzes");

  const stats: PlatformStats = {
    totalPaths: 0,
    totalModules: 0,
    totalLessons: 0,
    totalWords: 0,
    totalEstimatedMinutes: 0,
    totalQuizzes: 0,
    totalQuizQuestions: 0,
    totalExercises: 0,
    paths: [],
    contentGaps: [],
  };

  if (!fs.existsSync(pathsDir)) return stats;

  // Scan paths
  const pathDirs = fs.readdirSync(pathsDir);
  for (const pathDir of pathDirs) {
    const pathJsonFile = path.join(pathsDir, pathDir, "path.json");
    if (!fs.existsSync(pathJsonFile)) continue;

    let pathTitle = pathDir;
    try {
      const data = JSON.parse(fs.readFileSync(pathJsonFile, "utf-8"));
      pathTitle = data.title || pathDir;
    } catch { /* use dir name */ }

    const pathStat: PathStats = {
      slug: pathDir,
      title: pathTitle,
      moduleCount: 0,
      lessonCount: 0,
      totalWords: 0,
      totalEstimatedMinutes: 0,
      modules: [],
    };

    stats.totalPaths++;

    // Scan modules within path
    const moduleDirs = fs.readdirSync(path.join(pathsDir, pathDir));
    for (const moduleDir of moduleDirs) {
      const moduleJsonFile = path.join(pathsDir, pathDir, moduleDir, "module.json");
      if (!fs.existsSync(moduleJsonFile)) continue;

      let moduleTitle = moduleDir;
      try {
        const data = JSON.parse(fs.readFileSync(moduleJsonFile, "utf-8"));
        moduleTitle = data.title || moduleDir;
      } catch { /* use dir name */ }

      const moduleStat: ModuleStats = {
        slug: moduleDir,
        title: moduleTitle,
        lessonCount: 0,
        totalWords: 0,
        lessons: [],
      };

      pathStat.moduleCount++;
      stats.totalModules++;

      // Scan lessons within module
      const lessonDirs = fs.readdirSync(path.join(pathsDir, pathDir, moduleDir));
      for (const lessonDir of lessonDirs) {
        const lessonFile = path.join(pathsDir, pathDir, moduleDir, lessonDir, "index.mdx");
        if (!fs.existsSync(lessonFile)) continue;

        try {
          const content = fs.readFileSync(lessonFile, "utf-8");
          const { data, content: body } = matter(content);
          const wordCount = body.split(/\s+/).filter(Boolean).length;
          const exerciseMatches = body.match(/<Exercise/g);
          const exerciseCount = exerciseMatches ? exerciseMatches.length : 0;

          const lessonStat: LessonStats = {
            slug: lessonDir,
            title: data.title || lessonDir,
            wordCount,
            estimatedMinutes: data.estimatedMinutes || 0,
            xpReward: data.xpReward || 0,
            hasQuiz: body.includes("<Quiz"),
            hasExercises: exerciseCount > 0,
            exerciseCount,
            objectiveCount: (data.objectives || []).length,
          };

          moduleStat.lessons.push(lessonStat);
          moduleStat.lessonCount++;
          moduleStat.totalWords += wordCount;
          pathStat.lessonCount++;
          pathStat.totalWords += wordCount;
          pathStat.totalEstimatedMinutes += data.estimatedMinutes || 0;
          stats.totalLessons++;
          stats.totalWords += wordCount;
          stats.totalEstimatedMinutes += data.estimatedMinutes || 0;
          stats.totalExercises += exerciseCount;
        } catch { /* skip malformed */ }
      }

      // Content gap detection: module has 0 lessons
      if (moduleStat.lessonCount === 0) {
        stats.contentGaps.push(`${pathTitle} > ${moduleTitle}: 0 lessons`);
      }

      pathStat.modules.push(moduleStat);
    }

    // Content gap detection: path has 0 modules
    if (pathStat.moduleCount === 0) {
      stats.contentGaps.push(`${pathTitle}: 0 modules`);
    }

    stats.paths.push(pathStat);
  }

  // Scan quizzes
  if (fs.existsSync(quizzesDir)) {
    scanQuizzes(quizzesDir, stats);
  }

  return stats;
}

function scanQuizzes(dir: string, stats: PlatformStats) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      scanQuizzes(path.join(dir, entry.name), stats);
    } else if (entry.name.endsWith(".json") && entry.name !== "schema.json") {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(dir, entry.name), "utf-8"));
        if (data.questions) {
          stats.totalQuizzes++;
          stats.totalQuizQuestions += data.questions.length;
        }
      } catch { /* skip */ }
    }
  }
}
