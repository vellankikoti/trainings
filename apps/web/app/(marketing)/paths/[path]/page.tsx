import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPaths, getPathWithModules } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PathProgressOverlay } from "@/components/paths/PathProgressOverlay";

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

const COLOR_MAP: Record<string, { badge: string }> = {
  green: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800" },
  blue: { badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-800" },
  red: { badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-800" },
  orange: { badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800" },
  yellow: { badge: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-800" },
  purple: { badge: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-800" },
};

export default function PathPage({ params }: PathPageProps) {
  const data = getPathWithModules(params.path);
  if (!data) notFound();

  const colors = COLOR_MAP[data.color] || COLOR_MAP.blue;
  const pathDashboardHref = `/learn/${data.slug}`;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
        <ChevronRight />
        <Link href="/paths" className="transition-colors hover:text-foreground">Paths</Link>
        <ChevronRight />
        <span className="font-medium text-foreground">{data.title}</span>
      </nav>

      {/* Hero */}
      <div className="mb-14">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{data.title}</h1>
          <Badge variant="outline" className={colors.badge}>
            {data.difficulty}
          </Badge>
        </div>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {data.description}
        </p>

        {/* Stats */}
        <div className="mt-8 flex flex-wrap gap-8">
          <StatPill value={`${data.totalModules}`} label="Courses" />
          <StatPill value={`${data.totalLessons}+`} label="Lessons" />
          <StatPill value={`${data.estimatedHours}h`} label="Est. Time" />
        </div>

        {/* Progress overlay for authenticated users */}
        <PathProgressOverlay pathSlug={data.slug} firstLessonHref={pathDashboardHref} />

        {/* CTA */}
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link href={pathDashboardHref}>
              Explore Courses
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </Button>
        </div>
      </div>

      {/* Courses in this path */}
      <div className="mb-14">
        <h2 className="text-2xl font-bold">Courses in this path</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Recommended order shown. Learn in any order you prefer.
        </p>

        <div className="mt-8 space-y-4">
          {data.modulesData.map((mod) => (
            <Link
              key={mod.slug}
              href={`/learn/${data.slug}/${mod.slug}`}
              className="group flex items-start gap-5 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md md:p-6"
            >
              {/* Order number */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.07] text-base font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                {mod.order}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-foreground transition-colors group-hover:text-primary md:text-lg">
                    {mod.title}
                  </h3>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {mod.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                    {mod.lessonsCount} lessons
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {mod.estimatedHours}h
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden shrink-0 self-center sm:block">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/30 transition-all group-hover:translate-x-1 group-hover:text-primary">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Capstone */}
      {data.capstoneProject && (
        <div className="mb-14 rounded-2xl border border-primary/20 bg-primary/[0.03] p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold">Capstone Project</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {data.capstoneProject}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 p-8 text-center md:p-12">
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          Ready to start {data.title}?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-blue-100/80 md:text-base">
          Free and open-source. Start with any course and learn at your own pace.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild className="w-full bg-white text-blue-700 hover:bg-blue-50 sm:w-auto">
            <Link href={pathDashboardHref}>Get Started Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="w-full border-white/30 text-white hover:bg-white/10 hover:text-white sm:w-auto">
            <Link href="/paths">Browse All Paths</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ChevronRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-border">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
