import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getPath, getModulesForPath } from "@/lib/content";
import { getProfileId } from "@/lib/progress";
import { createAdminClient } from "@/lib/supabase/server";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { CourseCard } from "@/components/courses/CourseCard";

interface PathDashboardProps {
  params: Promise<{ path: string }>;
}

/* ─── Data ──────────────────────────────────────────────────────────────────── */

interface ModuleProgress {
  completedCount: number;
  totalLessons: number;
  resumeSlug: string | null;
}

async function getModuleProgressMap(
  pathSlug: string,
  modulesSlugs: string[],
): Promise<Map<string, ModuleProgress>> {
  const map = new Map<string, ModuleProgress>();
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return map;

    const profileId = await getProfileId(clerkId);
    if (!profileId) return map;

    const supabase = createAdminClient();
    const { data } = await supabase
      .from("lesson_progress")
      .select("module_slug, lesson_slug, status")
      .eq("user_id", profileId)
      .eq("path_slug", pathSlug)
      .eq("status", "completed");

    // Group completed lessons by module
    const completedByModule = new Map<string, Set<string>>();
    for (const row of data ?? []) {
      const set = completedByModule.get(row.module_slug) ?? new Set();
      set.add(row.lesson_slug);
      completedByModule.set(row.module_slug, set);
    }

    return completedByModule as unknown as Map<string, ModuleProgress>;
  } catch {
    return map;
  }
}

export async function generateMetadata({
  params,
}: PathDashboardProps): Promise<Metadata> {
  const { path: pathSlug } = await params;
  const pathMeta = getPath(pathSlug);
  if (!pathMeta) return { title: "Path Not Found" };

  return {
    title: `${pathMeta.title} — Learning Path`,
    description: pathMeta.description,
  };
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default async function PathDashboardPage({
  params,
}: PathDashboardProps) {
  const { path: pathSlug } = await params;

  const pathMeta = getPath(pathSlug);
  if (!pathMeta) notFound();

  const modules = getModulesForPath(pathSlug);

  // Fetch per-module completion data
  let completedByModule = new Map<string, Set<string>>();
  try {
    const { userId: clerkId } = await auth();
    if (clerkId) {
      const profileId = await getProfileId(clerkId);
      if (profileId) {
        const supabase = createAdminClient();
        const { data } = await supabase
          .from("lesson_progress")
          .select("module_slug, lesson_slug")
          .eq("user_id", profileId)
          .eq("path_slug", pathSlug)
          .eq("status", "completed");

        for (const row of data ?? []) {
          const set = completedByModule.get(row.module_slug) ?? new Set<string>();
          set.add(row.lesson_slug);
          completedByModule.set(row.module_slug, set);
        }
      }
    }
  } catch {
    // Continue with empty progress
  }

  // Calculate totals
  const totalLessonsAll = modules.reduce((s, m) => s + m.lessonsCount, 0);
  const totalCompletedAll = Array.from(completedByModule.values()).reduce(
    (s, set) => s + set.size,
    0,
  );
  const pathProgress =
    totalLessonsAll > 0
      ? Math.round((totalCompletedAll / totalLessonsAll) * 100)
      : 0;
  const coursesStarted = modules.filter(
    (m) => (completedByModule.get(m.slug)?.size ?? 0) > 0,
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Dashboard
          </Link>
          <span className="text-sm font-semibold text-foreground">
            {pathMeta.title}
          </span>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Path hero */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
            {pathMeta.title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {pathMeta.description}
          </p>
        </div>

        {/* Path progress summary */}
        <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">
                  Path Progress
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {coursesStarted} of {modules.length} courses started
                </span>
              </div>
              <div className="mt-3">
                <ProgressBar
                  value={pathProgress}
                  size="md"
                  showLabel
                  ariaLabel={`${pathMeta.title} progress: ${pathProgress}%`}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {totalCompletedAll} of {totalLessonsAll} lessons completed
              </p>
            </div>
          </div>
        </div>

        {/* Course cards */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-foreground">
            Courses in This Path
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => {
              const completed = completedByModule.get(mod.slug)?.size ?? 0;
              const total = mod.lessonsCount;
              const progress =
                total > 0 ? Math.round((completed / total) * 100) : 0;
              const isComplete = completed === total && total > 0;

              // Find resume lesson
              const resumeLesson = isComplete
                ? null
                : mod.lessons.find(
                    (l) => !completedByModule.get(mod.slug)?.has(l.slug),
                  );
              const href = resumeLesson
                ? `/learn/${pathSlug}/${mod.slug}/${resumeLesson.slug}`
                : `/learn/${pathSlug}/${mod.slug}`;

              return (
                <CourseCard
                  key={mod.slug}
                  slug={mod.slug}
                  pathSlug={pathSlug}
                  title={mod.title}
                  description={mod.description}
                  difficulty={pathMeta.difficulty}
                  lessonsCount={total}
                  estimatedHours={mod.estimatedHours}
                  progress={completed > 0 ? progress : null}
                  completedLessons={completed}
                  href={href}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
