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

/* ─── White Icon (CSS filtered to white for contrast on dark gradients) ───── */

function WhiteIcon({ iconUrl, alt }: { iconUrl: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-90"
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
      width={40}
      height={40}
      className="h-10 w-10 object-contain"
      style={{ filter: "brightness(0) invert(1)" }}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/* ─── Watermark Icon (large faded background decoration) ─────────────────── */

function WatermarkIcon({ iconUrl }: { iconUrl: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={iconUrl}
      alt=""
      width={160}
      height={160}
      className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 object-contain select-none"
      style={{ filter: "brightness(0) invert(1)", opacity: 0.06 }}
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
          "relative flex h-[140px] items-end overflow-hidden bg-gradient-to-br p-5",
          visual.gradient,
        )}
      >
        {/* Watermark: large faded icon in background */}
        <WatermarkIcon iconUrl={visual.iconUrl} />

        {/* Top-left: Icon in clean circle */}
        <div className="absolute left-5 top-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white/[0.12] backdrop-blur-md ring-1 ring-white/[0.15]">
          <WhiteIcon iconUrl={visual.iconUrl} alt={course.title} />
        </div>

        {/* Completed ribbon */}
        {variant === "completed" && (
          <div className="absolute right-0 top-4 flex items-center gap-1.5 rounded-l-full bg-emerald-500 py-1 pl-3 pr-4 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white">
              Done
            </span>
          </div>
        )}

        {/* Bottom of banner: metadata row */}
        <div className="relative z-10 flex w-full items-end justify-between">
          <span className="rounded-md bg-black/25 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm">
            {course.difficulty}
          </span>
          <div className="flex items-center gap-3 text-[12px] font-medium text-white/75">
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {course.estimatedHours}h
            </span>
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              {course.lessonsCount}
            </span>
          </div>
        </div>
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
