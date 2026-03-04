"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { getCourseVisual } from "@/lib/course-icons";
import type { MyCourse } from "@/lib/my-courses";

/* ─── Difficulty badge styling ─────────────────────────────────────────────── */

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner:
    "bg-white/20 text-white/90 backdrop-blur-sm",
  Intermediate:
    "bg-white/20 text-white/90 backdrop-blur-sm",
  Advanced:
    "bg-white/20 text-white/90 backdrop-blur-sm",
};

/* ─── Types ────────────────────────────────────────────────────────────────── */

type CardVariant = "active" | "upcoming" | "completed" | "explore";

interface MyCourseCardProps {
  course: MyCourse;
  variant: CardVariant;
}

/* ─── Tech Icon with Fallback ──────────────────────────────────────────────── */

function TechIcon({
  iconUrl,
  fallbackEmoji,
  alt,
}: {
  iconUrl: string;
  fallbackEmoji: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="text-3xl leading-none drop-shadow-lg" role="img" aria-label={alt}>
        {fallbackEmoji}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={iconUrl}
      alt={alt}
      width={48}
      height={48}
      className="h-12 w-12 object-contain drop-shadow-lg"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export function MyCourseCard({ course, variant }: MyCourseCardProps) {
  const visual = getCourseVisual(course.slug);
  const difficultyStyle =
    DIFFICULTY_STYLES[course.difficulty] ?? DIFFICULTY_STYLES.Beginner;

  const courseHref =
    variant === "active" && course.resumeLessonSlug
      ? `/learn/${course.pathSlug}/${course.slug}/${course.resumeLessonSlug}`
      : `/learn/${course.pathSlug}/${course.slug}`;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-0.5",
        variant === "active" && "border-border/60",
        variant === "upcoming" && "border-primary/20",
        variant === "completed" && "border-border/40",
        variant === "explore" && "border-border/40",
      )}
    >
      {/* ─── Gradient Banner with Tech Icon ───────────────────────────── */}
      <div
        className={cn(
          "relative flex h-32 items-center justify-between overflow-hidden bg-gradient-to-br px-5 sm:h-36 sm:px-6",
          visual.gradient,
        )}
      >
        {/* Decorative circles */}
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/[0.07]" />
        <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/[0.05]" />

        {/* Icon */}
        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 p-2 backdrop-blur-sm ring-1 ring-white/20">
          <TechIcon
            iconUrl={visual.iconUrl}
            fallbackEmoji={visual.fallbackEmoji}
            alt={course.title}
          />
        </div>

        {/* Banner metadata */}
        <div className="relative z-10 flex flex-col items-end gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              difficultyStyle,
            )}
          >
            {course.difficulty}
          </span>
          <span className="text-xs font-medium text-white/70">
            {course.estimatedHours}h · {course.lessonsCount} lessons
          </span>
        </div>

        {/* Completed overlay badge */}
        {variant === "completed" && (
          <div className="absolute left-0 top-0 z-20 flex items-center gap-1.5 rounded-br-xl bg-emerald-500 px-3 py-1.5 shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">
              Completed
            </span>
          </div>
        )}
      </div>

      {/* ─── Card Body ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Path label */}
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/70">
          {course.pathTitle}
        </p>

        {/* Title */}
        <h3 className="mt-1.5 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-lg">
          {course.title}
        </h3>

        {/* Description */}
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {course.description}
        </p>

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

        {/* Completed date */}
        {variant === "completed" && course.completedAt && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            Completed{" "}
            {new Date(course.completedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}

        {/* CTA */}
        <div className="mt-5">
          <Link
            href={courseHref}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
              variant === "active" &&
                "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
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
    </div>
  );
}
