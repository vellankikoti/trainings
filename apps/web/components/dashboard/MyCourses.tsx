"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ActiveCourse, CompletedCourse } from "@/lib/dashboard";
import { ProgressBar } from "@/components/shared/ProgressBar";

type Tab = "active" | "completed";

interface MyCoursesProps {
  activeCourses: ActiveCourse[];
  completedCourses: CompletedCourse[];
}

function ActiveCourseCard({ course }: { course: ActiveCourse }) {
  const courseHref = course.resumeLessonSlug
    ? `/learn/${course.pathSlug}/${course.moduleSlug}/${course.resumeLessonSlug}`
    : `/paths/${course.pathSlug}`;

  return (
    <div className="group rounded-xl border border-border/60 bg-card p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-hover)] hover:border-primary/20">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-primary/70">
            {course.pathTitle}
          </p>
          <h3 className="mt-1.5 truncate text-sm font-bold text-foreground">
            {course.moduleTitle}
          </h3>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {course.difficulty}
        </span>
      </div>
      <div className="mt-4">
        <ProgressBar
          value={course.progress}
          size="md"
          showLabel
          ariaLabel={`${course.moduleTitle} progress`}
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          {course.completedLessons}/{course.totalLessons} lessons
        </p>
        <Link
          href={courseHref}
          className="text-xs font-semibold text-primary transition-colors hover:text-primary/80 group-hover:underline"
        >
          Continue →
        </Link>
      </div>
    </div>
  );
}

function CompletedCourseCard({ course }: { course: CompletedCourse }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-foreground">
            {course.moduleTitle}
          </h3>
          {course.completedAt && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Completed{" "}
              {new Date(course.completedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
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
            className="text-emerald-600 dark:text-emerald-400"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      </div>
    </div>
  );
}

export function MyCourses({
  activeCourses,
  completedCourses,
}: MyCoursesProps) {
  const [tab, setTab] = useState<Tab>("active");

  const hasAnyCourses =
    activeCourses.length > 0 || completedCourses.length > 0;

  if (!hasAnyCourses) {
    return (
      <section>
        <h2 className="text-lg font-bold text-foreground">My Courses</h2>
        <div className="mt-4 rounded-xl border border-dashed border-border/80 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t started any courses yet.
          </p>
          <Link
            href="/paths"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Browse Learning Paths
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
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">My Courses</h2>
        <div className="flex gap-1 rounded-lg bg-muted p-1" role="tablist" aria-label="Course status filter">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "active"}
            onClick={() => setTab("active")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
              tab === "active"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            In Progress ({activeCourses.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "completed"}
            onClick={() => setTab("completed")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
              tab === "completed"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Completed ({completedCourses.length})
          </button>
        </div>
      </div>

      <div
        className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="tabpanel"
      >
        {tab === "active" &&
          activeCourses.map((course) => (
            <ActiveCourseCard
              key={`${course.pathSlug}/${course.moduleSlug}`}
              course={course}
            />
          ))}
        {tab === "completed" &&
          completedCourses.map((course) => (
            <CompletedCourseCard
              key={`${course.pathSlug}/${course.moduleSlug}`}
              course={course}
            />
          ))}
        {tab === "active" && activeCourses.length === 0 && (
          <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
            No courses in progress.
          </p>
        )}
        {tab === "completed" && completedCourses.length === 0 && (
          <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
            No completed courses yet.
          </p>
        )}
      </div>
    </section>
  );
}
