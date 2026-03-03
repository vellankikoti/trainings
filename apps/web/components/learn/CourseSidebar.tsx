"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/shared/ProgressBar";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

export interface CourseLessonRef {
  slug: string;
  title: string;
  order: number;
}

interface CourseSidebarProps {
  pathSlug: string;
  pathTitle: string;
  moduleSlug: string;
  courseTitle: string;
  lessons: CourseLessonRef[];
  completedLessons: string[];
  courseProgress: number;
  isOpen: boolean;
  onClose: () => void;
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

type LessonStatus = "completed" | "current" | "not-started";

function getLessonStatus(
  slug: string,
  currentSlug: string,
  completedSet: Set<string>,
): LessonStatus {
  if (slug === currentSlug) return "current";
  if (completedSet.has(slug)) return "completed";
  return "not-started";
}

/* ─── Icons ─────────────────────────────────────────────────────────────────── */

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function LessonStatusIcon({ status, order }: { status: LessonStatus; order: number }) {
  if (status === "completed") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <CheckIcon />
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm">
        <PlayIcon />
      </span>
    );
  }
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground/40">
      {String(order).padStart(2, "0")}
    </span>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function CourseSidebar({
  pathSlug,
  pathTitle,
  moduleSlug,
  courseTitle,
  lessons,
  completedLessons,
  courseProgress,
  isOpen,
  onClose,
}: CourseSidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);
  const currentLessonRef = useRef<HTMLAnchorElement>(null);

  const completedSet = useMemo(
    () => new Set(completedLessons),
    [completedLessons],
  );

  // Derive current lesson from URL
  const segments = pathname.split("/").filter(Boolean);
  const currentLessonSlug = segments[3] ?? "";

  // Scroll current lesson into view
  useEffect(() => {
    const timer = setTimeout(() => {
      currentLessonRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Auto-close on mobile after navigation
  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        id="course-sidebar"
        role="navigation"
        aria-label="Course navigation"
        className={cn(
          "fixed left-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-72 flex-col border-r border-border/60 bg-card transition-transform duration-200 ease-in-out",
          "lg:sticky lg:z-0 lg:translate-x-0 lg:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:hidden",
          isOpen && "lg:flex",
        )}
      >
        {/* Header — course title + progress */}
        <div className="shrink-0 border-b border-border/60 bg-muted/40 px-4 py-4">
          <Link
            href={`/learn/${pathSlug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-foreground/50 transition-colors hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            {pathTitle}
          </Link>
          <h2 className="mt-2 text-sm font-bold leading-tight text-foreground">
            {courseTitle}
          </h2>
          <div className="mt-3">
            <ProgressBar
              value={courseProgress}
              size="sm"
              showLabel
              ariaLabel={`${courseTitle} progress: ${courseProgress}%`}
            />
          </div>
        </div>

        {/* Flat lesson list (scrollable) */}
        <div className="flex-1 overflow-y-auto p-2">
          {lessons.map((lesson) => {
            const status = getLessonStatus(
              lesson.slug,
              currentLessonSlug,
              completedSet,
            );
            const isCurrent = status === "current";

            return (
              <Link
                key={lesson.slug}
                ref={isCurrent ? currentLessonRef : undefined}
                href={`/learn/${pathSlug}/${moduleSlug}/${lesson.slug}`}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-all",
                  isCurrent
                    ? "bg-primary/10 font-semibold"
                    : "hover:bg-muted/60",
                )}
                aria-current={isCurrent ? "page" : undefined}
              >
                <LessonStatusIcon status={status} order={lesson.order} />
                <span
                  className={cn(
                    "truncate leading-tight",
                    isCurrent
                      ? "text-primary"
                      : status === "completed"
                        ? "text-foreground/70 group-hover:text-foreground"
                        : "text-foreground/80 group-hover:text-foreground",
                  )}
                >
                  {lesson.title}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border/60 px-4 py-3">
          <p className="text-[11px] font-medium text-foreground/40">
            {completedLessons.length} of {lessons.length} lessons completed
          </p>
        </div>
      </aside>
    </>
  );
}
