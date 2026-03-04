import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/shared/ProgressBar";
import type { MyCourse } from "@/lib/my-courses";

/* ─── Color map for path badges ─────────────────────────────────────────────── */

const COLOR_MAP: Record<string, string> = {
  green:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800",
  blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-800",
  red: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-800",
  orange:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800",
  yellow:
    "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-800",
  purple:
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-800",
};

/* ─── Difficulty badge styling ─────────────────────────────────────────────── */

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  Intermediate: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  Advanced: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
};

/* ─── Types ────────────────────────────────────────────────────────────────── */

type CardVariant = "active" | "upcoming" | "completed" | "explore";

interface MyCourseCardProps {
  course: MyCourse;
  variant: CardVariant;
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export function MyCourseCard({ course, variant }: MyCourseCardProps) {
  const badgeColor = COLOR_MAP[course.pathColor] || COLOR_MAP.blue;
  const difficultyStyle = DIFFICULTY_STYLES[course.difficulty] ?? DIFFICULTY_STYLES.Beginner;

  const courseHref =
    variant === "active" && course.resumeLessonSlug
      ? `/learn/${course.pathSlug}/${course.slug}/${course.resumeLessonSlug}`
      : `/learn/${course.pathSlug}/${course.slug}`;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 sm:p-6",
        "hover:shadow-md hover:border-primary/20",
        variant === "active" && "border-border/60",
        variant === "upcoming" && "border-primary/15 bg-primary/[0.02]",
        variant === "completed" && "border-border/40",
        variant === "explore" && "border-border/40",
      )}
    >
      {/* Top row: Path badge + metadata */}
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            badgeColor,
          )}
        >
          {course.pathTitle}
        </span>
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              difficultyStyle,
            )}
          >
            {course.difficulty}
          </span>
        </div>
      </div>

      {/* Title + Description */}
      <div className="mt-4 flex-1">
        <h3 className="text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-lg">
          {course.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {course.description}
        </p>
      </div>

      {/* Stats row */}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-50"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          {course.lessonsCount} lessons
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-50"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {course.estimatedHours}h
        </span>
      </div>

      {/* Progress section — only for active courses */}
      {variant === "active" && (
        <div className="mt-4">
          <ProgressBar
            value={course.progress}
            size="md"
            showLabel
            ariaLabel={`${course.title} progress`}
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {course.completedLessons} of {course.lessonsCount} lessons
          </p>
        </div>
      )}

      {/* Completed badge */}
      {variant === "completed" && (
        <div className="mt-4 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-600 dark:text-emerald-400"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Completed
          </span>
          {course.completedAt && (
            <span className="text-[11px] text-muted-foreground">
              {new Date(course.completedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="mt-5">
        <Link
          href={courseHref}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
            variant === "active" &&
              "bg-primary text-primary-foreground hover:bg-primary/90",
            variant === "upcoming" &&
              "border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10",
            variant === "completed" &&
              "border border-border/60 bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            variant === "explore" &&
              "border border-border/60 bg-card text-foreground hover:bg-muted/50",
          )}
        >
          {variant === "active" && (
            <>
              Continue Learning
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </>
          )}
          {variant === "upcoming" && "Begin Course"}
          {variant === "completed" && "Review Course"}
          {variant === "explore" && "Start Course"}
        </Link>
      </div>
    </div>
  );
}
