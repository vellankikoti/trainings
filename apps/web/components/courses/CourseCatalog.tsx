"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/shared/ProgressBar";
import type { CatalogCourse } from "@/app/(marketing)/courses/page";

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

/* ─── Difficulty constants ─────────────────────────────────────────────────── */

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "All Levels" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

/* ─── Component ─────────────────────────────────────────────────────────────── */

interface CourseCatalogProps {
  courses: CatalogCourse[];
}

export function CourseCatalog({ courses }: CourseCatalogProps) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [pathFilter, setPathFilter] = useState("all");

  // Unique path options
  const pathOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of courses) {
      if (!seen.has(c.pathSlug)) {
        seen.set(c.pathSlug, c.pathTitle);
      }
    }
    return [
      { value: "all", label: "All Paths" },
      ...Array.from(seen.entries()).map(([slug, title]) => ({
        value: slug,
        label: title,
      })),
    ];
  }, [courses]);

  // Filtered courses
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return courses.filter((c) => {
      if (difficulty !== "all" && c.difficulty !== difficulty) return false;
      if (pathFilter !== "all" && c.pathSlug !== pathFilter) return false;
      if (q && !c.title.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q) && !c.pathTitle.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [courses, search, difficulty, pathFilter]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {/* Path filter */}
        <select
          value={pathFilter}
          onChange={(e) => setPathFilter(e.target.value)}
          className="rounded-xl border border-border/60 bg-card px-3 py-2.5 text-sm text-foreground transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
        >
          {pathOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Difficulty filter */}
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-xl border border-border/60 bg-card px-3 py-2.5 text-sm text-foreground transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
        >
          {DIFFICULTY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="mt-4 text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "course" : "courses"} found
      </p>

      {/* Course grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => (
          <CourseCard key={`${course.pathSlug}/${course.slug}`} course={course} />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-lg font-semibold text-foreground/60">
            No courses match your filters
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setDifficulty("all");
              setPathFilter("all");
            }}
            className="mt-4 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Course Card ───────────────────────────────────────────────────────────── */

function CourseCard({ course }: { course: CatalogCourse }) {
  const badgeColor = COLOR_MAP[course.pathColor] || COLOR_MAP.blue;
  const isStarted = course.progress !== null && course.progress > 0;
  const isComplete = course.progress === 100;

  return (
    <Link
      href={`/learn/${course.pathSlug}/${course.slug}`}
      className="group flex flex-col rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
    >
      {/* Card body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Path badge */}
        <span
          className={cn(
            "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            badgeColor,
          )}
        >
          {course.pathTitle}
        </span>

        {/* Title */}
        <h3 className="mt-3 text-base font-bold text-foreground transition-colors group-hover:text-primary">
          {course.title}
        </h3>

        {/* Description */}
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {course.description}
        </p>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            {course.lessonsCount} lessons
          </span>
          <span className="inline-flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {course.estimatedHours}h
          </span>
          <span className="inline-flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 20h.01" />
              <path d="M7 20v-4" />
              <path d="M12 20v-8" />
              <path d="M17 20V8" />
            </svg>
            {course.difficulty}
          </span>
        </div>
      </div>

      {/* Progress footer — only if started */}
      {isStarted && (
        <div className="border-t border-border/40 px-5 py-3">
          <div className="flex items-center justify-between text-xs">
            <span className={cn(
              "font-semibold",
              isComplete ? "text-emerald-600 dark:text-emerald-400" : "text-foreground/60",
            )}>
              {isComplete ? "Completed" : `${course.progress}% complete`}
            </span>
            {isComplete && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-500"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
          </div>
          {!isComplete && (
            <div className="mt-1.5">
              <ProgressBar
                value={course.progress ?? 0}
                size="sm"
                ariaLabel={`${course.title} progress`}
              />
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
