"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { getCourseVisual } from "@/lib/course-icons";
import { CourseIcon, WatermarkIcon } from "./CourseCardIcons";

/* ─── Types ────────────────────────────────────────────────────────────────── */

export interface CourseCardProps {
  /** Module slug — used to resolve gradient + icon via getCourseVisual() */
  slug: string;
  /** Learning-path slug — used to build the course href */
  pathSlug: string;
  title: string;
  description: string;
  difficulty: string;
  lessonsCount: number;
  estimatedHours: number;
  /** Completion percentage (0-100). null = no progress / signed out. */
  progress?: number | null;
  /** Number of completed lessons (for "X of Y lessons" label) */
  completedLessons?: number;
  /** Learning-path title — shown as a label above the course title */
  pathTitle?: string;
  /** Override the default href */
  href?: string;
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export function CourseCard({
  slug,
  pathSlug,
  title,
  description,
  difficulty,
  lessonsCount,
  estimatedHours,
  progress,
  completedLessons,
  pathTitle,
  href,
}: CourseCardProps) {
  const visual = getCourseVisual(slug);
  const courseHref = href ?? `/learn/${pathSlug}/${slug}`;
  const isStarted = progress != null && progress > 0;
  const isComplete = progress === 100;

  return (
    <Link
      href={courseHref}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1",
        isComplete
          ? "border-border/40"
          : isStarted
            ? "border-border/50 ring-1 ring-primary/10"
            : "border-border/40",
      )}
    >
      {/* ─── Gradient Banner ──────────────────────────────────────────── */}
      <div
        className={cn(
          "relative flex h-[160px] flex-col justify-between overflow-hidden bg-gradient-to-br p-5",
          visual.gradient,
        )}
      >
        {/* Large watermark icon */}
        <WatermarkIcon iconUrl={visual.iconUrl} />

        {/* Top row: Icon + Difficulty */}
        <div className="relative z-10 flex items-start justify-between">
          {/* Colorful icon in white container */}
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-2xl bg-white shadow-lg shadow-black/15">
            <CourseIcon iconUrl={visual.iconUrl} alt={title} />
          </div>

          {/* Difficulty badge */}
          <span className="rounded-lg bg-black/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            {difficulty}
          </span>
        </div>

        {/* Bottom row: Stats */}
        <div className="relative z-10 flex items-center gap-4 text-[13px] font-medium text-white/80">
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {estimatedHours} hours
          </span>
          <span className="h-3.5 w-px bg-white/30" />
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            {lessonsCount} lessons
          </span>
        </div>

        {/* Completed ribbon */}
        {isComplete && (
          <div className="absolute right-0 top-5 z-20 flex items-center gap-1.5 rounded-l-full bg-emerald-500 py-1.5 pl-3 pr-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white">
              Completed
            </span>
          </div>
        )}
      </div>

      {/* ─── Card Body ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-5">
        {/* Path label */}
        {pathTitle && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/60">
            {pathTitle}
          </p>
        )}

        {/* Title */}
        <h3 className={cn(
          "text-[15px] font-bold leading-snug text-foreground transition-colors group-hover:text-primary",
          pathTitle ? "mt-1.5" : "mt-0",
        )}>
          {title}
        </h3>

        {/* Description */}
        <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Progress section */}
        {isStarted && !isComplete && (
          <div className="mt-4">
            <ProgressBar
              value={progress ?? 0}
              size="md"
              showLabel
              ariaLabel={`${title} progress`}
            />
            {completedLessons != null && (
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {completedLessons} of {lessonsCount} lessons
              </p>
            )}
          </div>
        )}
      </div>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <div className="border-t border-border/40 px-5 py-3">
        {isComplete ? (
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Completed
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        ) : isStarted ? (
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground/60">
              {progress}% complete
            </span>
            <span className="font-semibold text-primary">
              Continue
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Not started</span>
            <span className="font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Start Course
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
