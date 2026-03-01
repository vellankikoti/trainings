import fs from "fs";
import path from "path";

function getContentStats() {
  const contentRoot = path.join(process.cwd(), "..", "..", "content", "paths");

  let totalPaths = 0;
  let totalModules = 0;
  let totalLessons = 0;

  if (!fs.existsSync(contentRoot)) return { totalPaths, totalModules, totalLessons };

  const pathDirs = fs.readdirSync(contentRoot);
  for (const pathDir of pathDirs) {
    const pathJson = path.join(contentRoot, pathDir, "path.json");
    if (!fs.existsSync(pathJson)) continue;
    totalPaths++;

    const moduleDirs = fs.readdirSync(path.join(contentRoot, pathDir));
    for (const moduleDir of moduleDirs) {
      const moduleJson = path.join(contentRoot, pathDir, moduleDir, "module.json");
      if (!fs.existsSync(moduleJson)) continue;
      totalModules++;

      const lessonDirs = fs.readdirSync(path.join(contentRoot, pathDir, moduleDir));
      for (const lessonDir of lessonDirs) {
        const lessonFile = path.join(contentRoot, pathDir, moduleDir, lessonDir, "index.mdx");
        if (fs.existsSync(lessonFile)) totalLessons++;
      }
    }
  }

  return { totalPaths, totalModules, totalLessons };
}

function getQuizStats() {
  const quizRoot = path.join(process.cwd(), "..", "..", "content", "quizzes");
  let totalQuizzes = 0;
  let totalQuestions = 0;

  if (!fs.existsSync(quizRoot)) return { totalQuizzes, totalQuestions };

  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        scanDir(path.join(dir, entry.name));
      } else if (entry.name.endsWith(".json") && entry.name !== "schema.json") {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(dir, entry.name), "utf-8"));
          if (data.questions) {
            totalQuizzes++;
            totalQuestions += data.questions.length;
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }

  scanDir(quizRoot);
  return { totalQuizzes, totalQuestions };
}

export default function AdminOverviewPage() {
  const contentStats = getContentStats();
  const quizStats = getQuizStats();

  const stats = [
    { label: "Learning Paths", value: contentStats.totalPaths, description: "Content paths available" },
    { label: "Modules", value: contentStats.totalModules, description: "Modules across all paths" },
    { label: "Lessons", value: contentStats.totalLessons, description: "MDX lesson files" },
    { label: "Quizzes", value: quizStats.totalQuizzes, description: `${quizStats.totalQuestions} total questions` },
  ];

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      <p className="mt-2 text-muted-foreground">
        Platform content and statistics at a glance.
      </p>

      {/* Stats Grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <a
            href="/admin/content"
            className="rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <h3 className="font-medium">View Content</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse all lessons, modules, and paths
            </p>
          </a>
          <a
            href="/admin/users"
            className="rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <h3 className="font-medium">View Users</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse registered users and activity
            </p>
          </a>
          <a
            href="/paths"
            className="rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <h3 className="font-medium">Learning Paths</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              View the public paths page
            </p>
          </a>
        </div>
      </div>

      {/* Platform Info */}
      <div className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Platform Info</h2>
        <div className="mt-4 grid gap-2 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Platform</span>
            <span>DEVOPS ENGINEERS</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Framework</span>
            <span>Next.js 14</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Auth</span>
            <span>Clerk</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Database</span>
            <span>Supabase PostgreSQL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Content Engine</span>
            <span>MDX (next-mdx-remote)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
