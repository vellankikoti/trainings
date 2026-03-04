"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { getCourseVisual } from "@/lib/course-icons";
import type { MyCourse } from "@/lib/my-courses";

/* ─── Types ────────────────────────────────────────────────────────────────── */

type CardVariant = "active" | "upcoming" | "completed" | "explore";

interface MyCourseCardProps {
  course: MyCourse;
  variant: CardVariant;
}

/* ─── Icon Components ──────────────────────────────────────────────────────── */

/** Primary white icon — large, crisp, high contrast on dark gradients */
function CourseIcon({ iconUrl, alt }: { iconUrl: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={iconUrl}
      alt={alt}
      width={44}
      height={44}
      className="h-11 w-11 shrink-0 object-contain brightness-0 invert drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)]"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/** Background watermark icon — large, subtle, adds depth */
function WatermarkIcon({ iconUrl }: { iconUrl: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={iconUrl}
      alt=""
      width={200}
      height={200}
      className="pointer-events-none absolute -bottom-8 -right-8 h-[200px] w-[200px] select-none object-contain brightness-0 invert opacity-[0.07]"
      loading="lazy"
      aria-hidden="true"
      onError={() => setFailed(true)}
    />
  );
}

/* ─── Main Component ───────────────────────────────────────────────────────── */

export function MyCourseCard({ course, variant }: MyCourseCardProps) {
  const visual = getCourseVisual(course.slug);

  const courseHref =
    variant === "active" && course.resumeLessonSlug
      ? `/learn/${course.pathSlug}/${course.slug}/${course.resumeLessonSlug}`
      : `/learn/${course.pathSlug}/${course.slug}`;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1",
        variant === "active" && "border-border/50 ring-1 ring-primary/10",
        variant === "upcoming" && "border-primary/20",
        variant === "completed" && "border-border/40",
        variant === "explore" && "border-border/40",
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
          {/* Icon in frosted glass container */}
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-white/[0.12] shadow-lg shadow-black/10 ring-1 ring-white/[0.2] backdrop-blur-xl">
            <CourseIcon iconUrl={visual.iconUrl} alt={course.title} />
          </div>

          {/* Difficulty badge */}
          <span className="rounded-lg bg-black/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            {course.difficulty}
          </span>
        </div>

        {/* Bottom row: Stats */}
        <div className="relative z-10 flex items-center gap-4 text-[13px] font-medium text-white/80">
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {course.estimatedHours} hours
          </span>
          <span className="h-3.5 w-px bg-white/30" />
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            {course.lessonsCount} lessons
          </span>
        </div>

        {/* Completed ribbon */}
        {variant === "completed" && (
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
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/60">
          {course.pathTitle}
        </p>

        {/* Title */}
        <h3 className="mt-1.5 text-[15px] font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {course.title}
        </h3>

        {/* Description */}
        <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
          {course.description}
        </p>

        {/* Progress — active only */}
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

        {/* CTA Button */}
        <div className="mt-4">
          <Link
            href={courseHref}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
              variant === "active" &&
                "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
              variant === "upcoming" &&
                "border border-primary/25 bg-primary/5 text-primary hover:bg-primary/10",
              variant === "completed" &&
                "border border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              variant === "explore" &&
                "border border-border/50 text-foreground hover:bg-muted/50",
            )}
          >
            {variant === "active" && (
              <>
                Continue Learning
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
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
