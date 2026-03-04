import fs from "fs";
import path from "path";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";

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

async function getPlatformStats() {
  try {
    const supabase = createAdminClient();
    const [users, institutes, orgs, pendingApprovals] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("institutes").select("id", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("organizations").select("id", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("approval_requests").select("id", { count: "exact", head: true }).eq("status", "pending_review").is("deleted_at", null),
    ]);
    return {
      totalUsers: users.count ?? 0,
      totalInstitutes: institutes.count ?? 0,
      totalOrgs: orgs.count ?? 0,
      pendingApprovals: pendingApprovals.count ?? 0,
    };
  } catch {
    return { totalUsers: 0, totalInstitutes: 0, totalOrgs: 0, pendingApprovals: 0 };
  }
}

const STAT_CONFIGS = [
  {
    gradient: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50 dark:bg-blue-950/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    gradient: "from-emerald-500 to-emerald-600",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    gradient: "from-violet-500 to-violet-600",
    bgLight: "bg-violet-50 dark:bg-violet-950/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    gradient: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50 dark:bg-amber-950/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

export default async function AdminOverviewPage() {
  const contentStats = getContentStats();
  const quizStats = getQuizStats();
  const platformStats = await getPlatformStats();

  const contentCards = [
    { label: "Learning Paths", value: contentStats.totalPaths, description: "Content paths available" },
    { label: "Modules", value: contentStats.totalModules, description: "Modules across all paths" },
    { label: "Lessons", value: contentStats.totalLessons, description: "MDX lesson files" },
    { label: "Quizzes", value: quizStats.totalQuizzes, description: `${quizStats.totalQuestions} total questions` },
  ];

  const quickActions = [
    {
      title: "Manage Content",
      description: "Browse and manage lessons, modules, and learning paths",
      href: "/admin/content",
      gradient: "from-blue-500 to-cyan-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
    {
      title: "View Users",
      description: "Browse registered users, roles, and activity",
      href: "/admin/users",
      gradient: "from-violet-500 to-purple-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: "Review Approvals",
      description: `${platformStats.pendingApprovals} pending registration${platformStats.pendingApprovals !== 1 ? "s" : ""} to review`,
      href: "/admin/approvals",
      gradient: "from-amber-500 to-orange-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
    {
      title: "Learning Paths",
      description: "View the public-facing learning paths page",
      href: "/paths",
      gradient: "from-emerald-500 to-teal-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="mt-1.5 text-base text-slate-500 dark:text-slate-400">
          Platform content, users, and statistics at a glance.
        </p>
      </div>

      {/* Platform Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Users</p>
              <p className="mt-1.5 text-3xl font-bold text-slate-900 dark:text-white">{platformStats.totalUsers}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Registered on platform</p>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Institutes</p>
              <p className="mt-1.5 text-3xl font-bold text-slate-900 dark:text-white">{platformStats.totalInstitutes}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Training institutes</p>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Organizations</p>
              <p className="mt-1.5 text-3xl font-bold text-slate-900 dark:text-white">{platformStats.totalOrgs}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Hiring organizations</p>
        </div>

        <Link href="/admin/approvals" className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Approvals</p>
              <p className="mt-1.5 text-3xl font-bold text-slate-900 dark:text-white">{platformStats.pendingApprovals}</p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${platformStats.pendingApprovals > 0 ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" : "bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            {platformStats.pendingApprovals > 0 ? "Needs your attention" : "All caught up"}
          </p>
          {platformStats.pendingApprovals > 0 && (
            <div className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
          )}
        </Link>
      </div>

      {/* Content Stats */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Content Library</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contentCards.map((stat, i) => {
            const config = STAT_CONFIGS[i];
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <p className="mt-1.5 text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.bgLight} ${config.iconColor}`}>
                    {config.icon}
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{stat.description}</p>
                <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${config.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${action.gradient} text-white shadow-sm`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{action.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {action.description}
              </p>
              <div className="absolute right-4 top-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Platform Info */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Platform Info</h2>
        </div>
        <div className="divide-y divide-slate-100 px-6 dark:divide-slate-800">
          {[
            { label: "Platform", value: "DEVOPS ENGINEERS" },
            { label: "Framework", value: "Next.js 14" },
            { label: "Auth", value: "Clerk" },
            { label: "Database", value: "Supabase PostgreSQL" },
            { label: "Content Engine", value: "MDX (next-mdx-remote)" },
          ].map((info) => (
            <div key={info.label} className="flex items-center justify-between py-3.5 text-sm">
              <span className="font-medium text-slate-500 dark:text-slate-400">{info.label}</span>
              <span className="font-medium text-slate-900 dark:text-white">{info.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
