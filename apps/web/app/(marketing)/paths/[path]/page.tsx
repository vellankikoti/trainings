import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPaths, getPathWithModules } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PathPageProps {
  params: { path: string };
}

export function generateStaticParams() {
  const paths = getAllPaths();
  return paths.map((p) => ({ path: p.slug }));
}

export function generateMetadata({ params }: PathPageProps): Metadata {
  const data = getPathWithModules(params.path);
  if (!data) return { title: "Path Not Found" };

  return {
    title: data.title,
    description: data.description,
  };
}

const COLOR_MAP: Record<string, { badge: string; accent: string }> = {
  green: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800",
    accent: "text-emerald-600 dark:text-emerald-400",
  },
  blue: {
    badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-800",
    accent: "text-blue-600 dark:text-blue-400",
  },
  red: {
    badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-800",
    accent: "text-rose-600 dark:text-rose-400",
  },
  orange: {
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800",
    accent: "text-amber-600 dark:text-amber-400",
  },
  yellow: {
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-800",
    accent: "text-yellow-600 dark:text-yellow-400",
  },
  purple: {
    badge: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-800",
    accent: "text-violet-600 dark:text-violet-400",
  },
};

export default function PathPage({ params }: PathPageProps) {
  const data = getPathWithModules(params.path);
  if (!data) notFound();

  const colors = COLOR_MAP[data.color] || COLOR_MAP.blue;

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="mx-2 text-border">/</span>
        <Link href="/paths" className="hover:text-primary transition-colors">
          Paths
        </Link>
        <span className="mx-2 text-border">/</span>
        <span className="text-foreground font-medium">{data.title}</span>
      </nav>

      {/* Hero */}
      <div className="mb-16">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold md:text-4xl">{data.title}</h1>
          <Badge variant="outline" className={colors.badge}>
            {data.difficulty}
          </Badge>
        </div>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {data.description}
        </p>

        {/* Stats */}
        <div className="mt-8 flex flex-wrap gap-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8" />
                <path d="M12 17v4" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-bold">{data.totalModules}</div>
              <div className="text-xs text-muted-foreground">Modules</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-bold">{data.totalLessons}+</div>
              <div className="text-xs text-muted-foreground">Lessons</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-bold">{data.estimatedHours}h</div>
              <div className="text-xs text-muted-foreground">Est. Time</div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href={data.modulesData.length > 0 && data.modulesData[0].lessons.length > 0
              ? `/learn/${data.slug}/${data.modulesData[0].slug}/${data.modulesData[0].lessons[0].slug}`
              : `/paths/${data.slug}`
            }>
              Start This Path Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </Button>
        </div>
      </div>

      {/* What You'll Learn - Course Overview */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold md:text-3xl">Course Overview</h2>
        <p className="mt-2 text-muted-foreground">
          Here&apos;s everything you&apos;ll learn in this path. Sign up to access the full content.
        </p>

        <div className="mt-8 space-y-4">
          {data.modulesData.map((mod) => (
            <div
              key={mod.slug}
              className="rounded-xl border border-border/60 bg-card overflow-hidden"
            >
              {/* Module header */}
              <div className="flex items-start gap-4 p-5 md:p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {mod.order}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{mod.title}</h3>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-[11px]">
                        {mod.lessonsCount} lessons
                      </Badge>
                      <Badge variant="outline" className="text-[11px]">
                        {mod.estimatedHours}h
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {mod.description}
                  </p>
                </div>
              </div>

              {/* Lesson list */}
              {mod.lessons.length > 0 && (
                <div className="border-t border-border/60 bg-muted/30 px-5 py-4 md:px-6">
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {mod.lessons.map((lesson, i) => (
                      <Link
                        key={lesson.slug}
                        href={`/learn/${data.slug}/${mod.slug}/${lesson.slug}`}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-background hover:text-primary"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-medium bg-primary/10 text-primary">
                          {i + 1}
                        </span>
                        <span className="text-foreground/70 transition-colors group-hover:text-primary">
                          {lesson.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Capstone */}
      {data.capstoneProject && (
        <div className="mb-16 rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Capstone Project</h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                {data.capstoneProject}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 p-8 md:p-12 text-center">
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          Ready to start {data.title}?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-blue-100/80">
          Sign up for free and get instant access to all {data.totalLessons}+ lessons, hands-on labs, and projects.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            asChild
            className="w-full bg-white text-blue-700 hover:bg-blue-50 sm:w-auto"
          >
            <Link href={data.modulesData.length > 0 && data.modulesData[0].lessons.length > 0
              ? `/learn/${data.slug}/${data.modulesData[0].slug}/${data.modulesData[0].lessons[0].slug}`
              : `/paths/${data.slug}`
            }>Get Started Free</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="w-full border-white/30 text-white hover:bg-white/10 hover:text-white sm:w-auto"
          >
            <Link href="/paths">Browse All Paths</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
