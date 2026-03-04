"use client";

import Link from "next/link";

interface LessonRef {
  slug: string;
  title: string;
  order: number;
}

interface LessonSidebarProps {
  pathSlug: string;
  moduleSlug: string;
  moduleTitle: string;
  lessons: LessonRef[];
  currentLessonSlug: string;
  /** Slugs of lessons that have been completed (from DB) */
  completedSlugs?: string[];
}

export function LessonSidebar({
  pathSlug,
  moduleSlug,
  moduleTitle,
  lessons,
  currentLessonSlug,
  completedSlugs = [],
}: LessonSidebarProps) {
  const completedSet = new Set(completedSlugs);

  // Progress based on actual completions, not position
  const completedCount = lessons.filter((l) => completedSet.has(l.slug)).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <nav className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/60 bg-muted/40 px-4 py-4">
        <Link
          href={`/paths/${pathSlug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-foreground/60 hover:text-primary transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Path
        </Link>
        <h3 className="mt-2 text-sm font-bold text-foreground leading-tight">{moduleTitle}</h3>
        <div className="mt-3 flex items-center gap-2.5">
          <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-border/80">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-foreground/50 tabular-nums">
            {completedCount}/{lessons.length}
          </span>
        </div>
      </div>

      {/* Lesson list */}
      <div className="p-2 max-h-[calc(100vh-16rem)] overflow-y-auto">
        {lessons.map((lesson, i) => {
          const isCurrent = lesson.slug === currentLessonSlug;
          const isCompleted = completedSet.has(lesson.slug);

          return (
            <Link
              key={lesson.slug}
              href={`/learn/${pathSlug}/${moduleSlug}/${lesson.slug}`}
              className={`group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] transition-all ${
                isCurrent
                  ? "bg-primary/10 font-semibold shadow-sm"
                  : "hover:bg-muted/60"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                  isCurrent
                    ? "bg-primary text-white shadow-sm"
                    : isCompleted
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-foreground/50"
                }`}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span className={`truncate leading-tight ${
                isCurrent
                  ? "text-primary"
                  : isCompleted
                    ? "text-foreground/70 group-hover:text-foreground"
                    : "text-foreground/80 group-hover:text-foreground"
              }`}>
                {lesson.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
