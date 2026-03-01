import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface LessonInfo {
  path: string;
  pathTitle: string;
  module: string;
  moduleTitle: string;
  slug: string;
  title: string;
  order: number;
  estimatedMinutes: number;
  xpReward: number;
  wordCount: number;
}

function getAllLessons(): LessonInfo[] {
  const contentRoot = path.join(process.cwd(), "..", "..", "content", "paths");
  const lessons: LessonInfo[] = [];

  if (!fs.existsSync(contentRoot)) return lessons;

  const pathDirs = fs.readdirSync(contentRoot);
  for (const pathDir of pathDirs) {
    const pathJsonFile = path.join(contentRoot, pathDir, "path.json");
    if (!fs.existsSync(pathJsonFile)) continue;

    let pathTitle = pathDir;
    try {
      const pathData = JSON.parse(fs.readFileSync(pathJsonFile, "utf-8"));
      pathTitle = pathData.title || pathDir;
    } catch { /* use dir name */ }

    const moduleDirs = fs.readdirSync(path.join(contentRoot, pathDir));
    for (const moduleDir of moduleDirs) {
      const moduleJsonFile = path.join(contentRoot, pathDir, moduleDir, "module.json");
      if (!fs.existsSync(moduleJsonFile)) continue;

      let moduleTitle = moduleDir;
      try {
        const moduleData = JSON.parse(fs.readFileSync(moduleJsonFile, "utf-8"));
        moduleTitle = moduleData.title || moduleDir;
      } catch { /* use dir name */ }

      const lessonDirs = fs.readdirSync(path.join(contentRoot, pathDir, moduleDir));
      for (const lessonDir of lessonDirs) {
        const lessonFile = path.join(contentRoot, pathDir, moduleDir, lessonDir, "index.mdx");
        if (!fs.existsSync(lessonFile)) continue;

        try {
          const content = fs.readFileSync(lessonFile, "utf-8");
          const { data, content: body } = matter(content);
          const wordCount = body.split(/\s+/).filter(Boolean).length;

          lessons.push({
            path: pathDir,
            pathTitle,
            module: moduleDir,
            moduleTitle,
            slug: lessonDir,
            title: data.title || lessonDir,
            order: data.order || 0,
            estimatedMinutes: data.estimatedMinutes || 0,
            xpReward: data.xpReward || 0,
            wordCount,
          });
        } catch { /* skip malformed */ }
      }
    }
  }

  return lessons.sort((a, b) => {
    if (a.path !== b.path) return a.path.localeCompare(b.path);
    if (a.module !== b.module) return a.module.localeCompare(b.module);
    return a.order - b.order;
  });
}

export default function AdminContentPage() {
  const lessons = getAllLessons();
  const totalWords = lessons.reduce((sum, l) => sum + l.wordCount, 0);

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold">Content</h1>
      <p className="mt-2 text-muted-foreground">
        {lessons.length} lessons, {totalWords.toLocaleString()} total words
      </p>

      {lessons.length === 0 ? (
        <div className="mt-8 rounded-lg border bg-muted/50 p-8 text-center">
          <h2 className="text-xl font-semibold">No Lessons Found</h2>
          <p className="mt-2 text-muted-foreground">
            Create lessons in `content/paths/` to see them here.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Lesson</th>
                <th className="px-4 py-3 text-left font-medium">Path</th>
                <th className="px-4 py-3 text-left font-medium">Module</th>
                <th className="px-4 py-3 text-right font-medium">Words</th>
                <th className="px-4 py-3 text-right font-medium">Minutes</th>
                <th className="px-4 py-3 text-right font-medium">XP</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => (
                <tr key={`${lesson.path}-${lesson.module}-${lesson.slug}`} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <a
                      href={`/learn/${lesson.path}/${lesson.module}/${lesson.slug}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {lesson.title}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lesson.pathTitle}</td>
                  <td className="px-4 py-3 text-muted-foreground">{lesson.moduleTitle}</td>
                  <td className="px-4 py-3 text-right">{lesson.wordCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{lesson.estimatedMinutes}</td>
                  <td className="px-4 py-3 text-right">{lesson.xpReward}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
