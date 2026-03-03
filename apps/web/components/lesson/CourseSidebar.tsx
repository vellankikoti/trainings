"use client";

import { useState } from "react";
import Link from "next/link";

interface CourseSidebarProps {
  pathSlug: string;
  pathTitle: string;
  modules: Array<{
    slug: string;
    title: string;
    order: number;
    lessons: Array<{
      slug: string;
      title: string;
      order: number;
    }>;
  }>;
  currentModuleSlug: string;
  currentLessonSlug: string;
  completedLessons?: string[];
}

export function CourseSidebar({
  pathSlug,
  pathTitle,
  modules,
  currentModuleSlug,
  currentLessonSlug,
  completedLessons = [],
}: CourseSidebarProps) {
  // Initialize expanded state: current module open, all others collapsed
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const mod of modules) {
      initial[mod.slug] = mod.slug === currentModuleSlug;
    }
    return initial;
  });

  const toggleModule = (slug: string) => {
    setExpandedModules((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  // Calculate course-level progress
  const totalLessons = modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
  const completedCount = completedLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Determine module status
  const getModuleStatus = (mod: (typeof modules)[number]): "completed" | "in-progress" | "not-started" => {
    const moduleLessonSlugs = mod.lessons.map((l) => l.slug);
    const completedInModule = moduleLessonSlugs.filter((s) => completedLessons.includes(s)).length;

    if (completedInModule === mod.lessons.length && mod.lessons.length > 0) return "completed";
    if (completedInModule > 0 || mod.slug === currentModuleSlug) return "in-progress";
    return "not-started";
  };

  // Determine lesson status
  const getLessonStatus = (lessonSlug: string): "completed" | "current" | "not-started" => {
    if (lessonSlug === currentLessonSlug) return "current";
    if (completedLessons.includes(lessonSlug)) return "completed";
    return "not-started";
  };

  return (
    <nav className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="border-b border-border/60 bg-muted/40 px-4 py-4 shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-foreground/60 hover:text-primary transition-colors"
        >
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
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Dashboard
        </Link>

        <h3 className="mt-2 text-sm font-bold text-foreground leading-tight">
          {pathTitle}
        </h3>

        {/* Course progress bar */}
        <div className="mt-3 flex items-center gap-2.5">
          <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-border/80">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-foreground/50 tabular-nums">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Module list — scrollable */}
      <div className="overflow-y-auto flex-1 p-2">
        {modules.map((mod) => {
          const isExpanded = expandedModules[mod.slug] ?? false;
          const moduleStatus = getModuleStatus(mod);

          return (
            <div key={mod.slug} className="mb-1">
              {/* Module header — clickable to toggle */}
              <button
                onClick={() => toggleModule(mod.slug)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold transition-colors hover:bg-muted/60"
              >
                {/* Chevron icon */}
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
                  className={`shrink-0 text-foreground/40 transition-transform duration-200 ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>

                {/* Module title */}
                <span className="flex-1 truncate text-foreground/90">
                  {mod.title}
                </span>

                {/* Module status icon */}
                {moduleStatus === "completed" && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
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
                )}
                {moduleStatus === "in-progress" && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  </span>
                )}
                {moduleStatus === "not-started" && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <span className="h-2.5 w-2.5 rounded-full border-2 border-foreground/30" />
                  </span>
                )}
              </button>

              {/* Lessons — collapsible */}
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="ml-3 border-l border-border/50 pl-2 pb-1">
                  {mod.lessons.map((lesson) => {
                    const status = getLessonStatus(lesson.slug);

                    return (
                      <Link
                        key={lesson.slug}
                        href={`/learn/${pathSlug}/${mod.slug}/${lesson.slug}`}
                        className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-all ${
                          status === "current"
                            ? "bg-primary/10 font-semibold shadow-sm"
                            : "hover:bg-muted/60"
                        }`}
                      >
                        {/* Lesson status indicator */}
                        {status === "completed" && (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </span>
                        )}
                        {status === "current" && (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold shadow-sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          </span>
                        )}
                        {status === "not-started" && (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-foreground/50 text-[10px] font-bold">
                            {String(lesson.order).padStart(2, "0")}
                          </span>
                        )}

                        {/* Lesson title */}
                        <span
                          className={`truncate leading-tight ${
                            status === "current"
                              ? "text-primary"
                              : status === "completed"
                                ? "text-foreground/70 group-hover:text-foreground"
                                : "text-foreground/80 group-hover:text-foreground"
                          }`}
                        >
                          {lesson.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
