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
}

export function LessonSidebar({
  pathSlug,
  moduleSlug,
  moduleTitle,
  lessons,
  currentLessonSlug,
}: LessonSidebarProps) {
  const currentIndex = lessons.findIndex((l) => l.slug === currentLessonSlug);

  return (
    <nav className="space-y-1">
      {/* Module title */}
      <div className="mb-4">
        <Link
          href={`/paths/${pathSlug}`}
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to Path
        </Link>
        <h3 className="mt-2 text-sm font-bold text-foreground">{moduleTitle}</h3>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{
              width: `${lessons.length > 0 ? Math.round(((currentIndex + 1) / lessons.length) * 100) : 0}%`,
            }}
          />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Lesson {currentIndex + 1} of {lessons.length}
        </p>
      </div>

      {/* Lesson list */}
      <div className="space-y-0.5">
        {lessons.map((lesson, i) => {
          const isCurrent = lesson.slug === currentLessonSlug;
          const isPast = i < currentIndex;

          return (
            <Link
              key={lesson.slug}
              href={`/learn/${pathSlug}/${moduleSlug}/${lesson.slug}`}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isCurrent
                  ? "bg-primary/10 text-primary font-medium"
                  : isPast
                    ? "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    : "text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {/* Number badge */}
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isCurrent
                    ? "bg-primary text-white"
                    : isPast
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isPast ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>

              <span className="truncate">{lesson.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
