"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { MyCourseCard } from "@/components/courses/MyCourseCard";
import type { MyCoursesData } from "@/lib/my-courses";

/* ─── Section Header ───────────────────────────────────────────────────────── */

function SectionHeader({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle?: string;
  count?: number;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-baseline gap-3">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>
        {count !== undefined && count > 0 && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
            {count}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

/* ─── Explore Section with Filters ─────────────────────────────────────────── */

function ExploreSection({
  courses,
}: {
  courses: MyCoursesData["exploreCourses"];
}) {
  const [search, setSearch] = useState("");
  const [pathFilter, setPathFilter] = useState("all");

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

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return courses.filter((c) => {
      if (pathFilter !== "all" && c.pathSlug !== pathFilter) return false;
      if (
        q &&
        !c.title.toLowerCase().includes(q) &&
        !c.description.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [courses, search, pathFilter]);

  return (
    <section>
      <SectionHeader
        title="Explore More"
        subtitle="Discover new courses to expand your skills"
        count={courses.length}
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
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
        {pathOptions.length > 2 && (
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
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <MyCourseCard
              key={`${course.pathSlug}/${course.slug}`}
              course={course}
              variant="explore"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No courses match your search.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setPathFilter("all");
            }}
            className="mt-3 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────────── */

interface MyCoursesViewProps {
  data: MyCoursesData;
}

export function MyCoursesView({ data }: MyCoursesViewProps) {
  const {
    activeCourses,
    completedCourses,
    upNextCourses,
    exploreCourses,
    activePathTitle,
  } = data;

  const hasAnyCourses =
    activeCourses.length > 0 ||
    completedCourses.length > 0 ||
    upNextCourses.length > 0;

  return (
    <div className="space-y-12">
      {/* ─── Section 1: In Progress ─────────────────────────────────────── */}
      {activeCourses.length > 0 && (
        <section>
          <SectionHeader
            title="In Progress"
            subtitle="Continue where you left off"
            count={activeCourses.length}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activeCourses.map((course) => (
              <MyCourseCard
                key={`${course.pathSlug}/${course.slug}`}
                course={course}
                variant="active"
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── Section 2: Up Next ─────────────────────────────────────────── */}
      {upNextCourses.length > 0 && (
        <section>
          <SectionHeader
            title="Up Next"
            subtitle={
              activePathTitle
                ? `Continue your ${activePathTitle} path`
                : "Recommended courses for you"
            }
            count={upNextCourses.length}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upNextCourses.map((course) => (
              <MyCourseCard
                key={`${course.pathSlug}/${course.slug}`}
                course={course}
                variant="upcoming"
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── Section 3: Completed ───────────────────────────────────────── */}
      {completedCourses.length > 0 && (
        <section>
          <SectionHeader
            title="Completed"
            subtitle="Courses you've finished"
            count={completedCourses.length}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {completedCourses.map((course) => (
              <MyCourseCard
                key={`${course.pathSlug}/${course.slug}`}
                course={course}
                variant="completed"
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── Section 4: Explore More ────────────────────────────────────── */}
      {exploreCourses.length > 0 && (
        <ExploreSection courses={exploreCourses} />
      )}

      {/* ─── Empty State ────────────────────────────────────────────────── */}
      {!hasAnyCourses && exploreCourses.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h3 className="mt-5 text-lg font-bold text-foreground">
            No courses available
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Check back soon for new courses to get started on your learning
            journey.
          </p>
        </div>
      )}
    </div>
  );
}
