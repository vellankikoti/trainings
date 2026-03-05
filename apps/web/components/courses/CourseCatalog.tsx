"use client";

import { useMemo, useState } from "react";
import { CourseCard } from "./CourseCard";
import type { CatalogCourse } from "@/app/(marketing)/courses/page";

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
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => (
          <CourseCard
            key={`${course.pathSlug}/${course.slug}`}
            slug={course.slug}
            pathSlug={course.pathSlug}
            title={course.title}
            description={course.description}
            difficulty={course.difficulty}
            lessonsCount={course.lessonsCount}
            estimatedHours={course.estimatedHours}
            progress={course.progress}
            pathTitle={course.pathTitle}
          />
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
