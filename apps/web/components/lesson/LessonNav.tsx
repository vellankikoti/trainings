import Link from "next/link";

interface LessonNavProps {
  pathSlug: string;
  moduleSlug: string;
  prevLesson?: { slug: string; title: string } | null;
  nextLesson?: { slug: string; title: string } | null;
  currentIndex?: number;
  totalLessons?: number;
}

export function LessonNav({
  pathSlug,
  moduleSlug,
  prevLesson,
  nextLesson,
  currentIndex,
  totalLessons,
}: LessonNavProps) {
  return (
    <div className="mt-12 border-t border-border/60 pt-8">
      {currentIndex !== undefined && totalLessons !== undefined && (
        <p className="mb-4 text-center text-xs font-medium text-muted-foreground">
          Lesson {currentIndex + 1} of {totalLessons}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {prevLesson ? (
          <Link
            href={`/learn/${pathSlug}/${moduleSlug}/${prevLesson.slug}`}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Previous</p>
              <p className="truncate text-sm font-bold text-foreground group-hover:text-primary">
                {prevLesson.title}
              </p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link
            href={`/learn/${pathSlug}/${moduleSlug}/${nextLesson.slug}`}
            className="group flex items-center justify-end gap-3 rounded-xl border-2 border-primary/20 bg-primary/[0.03] p-4 text-right transition-all hover:border-primary/50 hover:bg-primary/[0.06] hover:shadow-md"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/70">Next Lesson</p>
              <p className="truncate text-sm font-bold text-foreground group-hover:text-primary">
                {nextLesson.title}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm transition-transform group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </Link>
        ) : (
          <Link
            href={`/paths/${pathSlug}`}
            className="group flex items-center justify-end gap-3 rounded-xl border-2 border-emerald-500/20 bg-emerald-500/[0.03] p-4 text-right transition-all hover:border-emerald-500/50 hover:bg-emerald-500/[0.06] hover:shadow-md"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70">Module Complete</p>
              <p className="truncate text-sm font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                Back to Path Overview
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
