"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/shared/ProgressBar";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SidebarLesson {
  slug: string;
  title: string;
  order: number;
}

export interface SidebarModule {
  slug: string;
  title: string;
  order: number;
  lessons: SidebarLesson[];
}

interface LearningSidebarProps {
  pathSlug: string;
  pathTitle: string;
  modules: SidebarModule[];
  currentModuleSlug: string;
  currentLessonSlug: string;
  completedLessons: string[];
  /** Overall course progress percentage (0-100), pre-calculated */
  courseProgress: number;
  /** Whether the sidebar is visible */
  isOpen: boolean;
  /** Close sidebar (used on mobile after navigation) */
  onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type LessonStatus = "completed" | "current" | "not-started";
type ModuleStatus = "completed" | "in-progress" | "not-started";

function getLessonStatus(
  slug: string,
  currentSlug: string,
  completedSet: Set<string>,
): LessonStatus {
  if (slug === currentSlug) return "current";
  if (completedSet.has(slug)) return "completed";
  return "not-started";
}

function getModuleStatus(
  mod: SidebarModule,
  currentModuleSlug: string,
  completedSet: Set<string>,
): ModuleStatus {
  const completedCount = mod.lessons.filter((l) =>
    completedSet.has(l.slug),
  ).length;
  if (completedCount === mod.lessons.length && mod.lessons.length > 0)
    return "completed";
  if (completedCount > 0 || mod.slug === currentModuleSlug)
    return "in-progress";
  return "not-started";
}

// ─── Status Icons ────────────────────────────────────────────────────────────

function CheckIcon({ className }: { className?: string }) {
  return (
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
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
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
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function PlayIcon() {
  return (
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
  );
}

// ─── Module Status Indicator ─────────────────────────────────────────────────

function ModuleStatusIcon({ status }: { status: ModuleStatus }) {
  if (status === "completed") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
        <CheckIcon className="text-emerald-600 dark:text-emerald-400" />
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
      <span className="h-2.5 w-2.5 rounded-full border-2 border-foreground/20" />
    </span>
  );
}

// ─── Lesson Status Indicator ─────────────────────────────────────────────────

function LessonStatusIcon({
  status,
  order,
}: {
  status: LessonStatus;
  order: number;
}) {
  if (status === "completed") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <CheckIcon />
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm">
        <PlayIcon />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground/40">
      {String(order).padStart(2, "0")}
    </span>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LearningSidebar({
  pathSlug,
  pathTitle,
  modules,
  currentModuleSlug,
  currentLessonSlug,
  completedLessons,
  courseProgress,
  isOpen,
  onClose,
}: LearningSidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);
  const currentLessonRef = useRef<HTMLAnchorElement>(null);

  // Build Set for O(1) completion lookups
  const completedSet = useMemo(() => new Set(completedLessons), [completedLessons]);

  // Accordion state: auto-expand current module
  const [expandedModules, setExpandedModules] = useState<
    Record<string, boolean>
  >(() => {
    const initial: Record<string, boolean> = {};
    for (const mod of modules) {
      initial[mod.slug] = mod.slug === currentModuleSlug;
    }
    return initial;
  });

  const toggleModule = useCallback((slug: string) => {
    setExpandedModules((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }, []);

  // Auto-expand current module on navigation
  useEffect(() => {
    setExpandedModules((prev) => {
      if (prev[currentModuleSlug]) return prev;
      return { ...prev, [currentModuleSlug]: true };
    });
  }, [currentModuleSlug]);

  // Scroll current lesson into view on mount and navigation
  useEffect(() => {
    const timer = setTimeout(() => {
      currentLessonRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Close sidebar on mobile/tablet after navigation
  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) {
      onClose();
    }
    // Only trigger on pathname change, not on onClose reference change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close sidebar on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const totalLessons = modules.reduce(
    (sum, mod) => sum + mod.lessons.length,
    0,
  );

  return (
    <>
      {/* Mobile/tablet overlay backdrop */}
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
        id="learning-sidebar"
        role="navigation"
        aria-label="Course navigation"
        className={cn(
          // Base styles
          "fixed left-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-72 flex-col border-r border-border/60 bg-card transition-transform duration-200 ease-in-out",
          // Responsive: on large screens, static positioning
          "lg:sticky lg:z-0 lg:translate-x-0 lg:transition-none",
          // Open/closed state for mobile/tablet
          isOpen ? "translate-x-0" : "-translate-x-full lg:hidden",
          // When open on desktop, show
          isOpen && "lg:flex",
        )}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-border/60 bg-muted/40 px-4 py-4">
          <Link
            href={`/paths/${pathSlug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-foreground/50 transition-colors hover:text-primary"
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
            Back to Path
          </Link>
          <h2 className="mt-2 text-sm font-bold leading-tight text-foreground">
            {pathTitle}
          </h2>
          <div className="mt-3">
            <ProgressBar
              value={courseProgress}
              size="sm"
              showLabel
              ariaLabel={`${pathTitle} progress: ${courseProgress}%`}
            />
          </div>
        </div>

        {/* Module tree (scrollable) */}
        <div className="flex-1 overflow-y-auto p-2">
          {modules.map((mod) => {
            const isExpanded = expandedModules[mod.slug] ?? false;
            const moduleStatus = getModuleStatus(
              mod,
              currentModuleSlug,
              completedSet,
            );
            const moduleCompletedCount = mod.lessons.filter((l) =>
              completedSet.has(l.slug),
            ).length;

            return (
              <div key={mod.slug} className="mb-1">
                {/* Module header button */}
                <button
                  type="button"
                  onClick={() => toggleModule(mod.slug)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold transition-colors hover:bg-muted/60"
                  aria-expanded={isExpanded}
                  aria-controls={`module-${mod.slug}`}
                >
                  <ChevronIcon
                    className={cn(
                      "shrink-0 text-foreground/40 transition-transform duration-200",
                      isExpanded && "rotate-90",
                    )}
                  />
                  <span className="flex-1 truncate text-foreground/90">
                    {mod.title}
                  </span>
                  <span className="shrink-0 text-[10px] font-medium tabular-nums text-foreground/40">
                    {moduleCompletedCount}/{mod.lessons.length}
                  </span>
                  <ModuleStatusIcon status={moduleStatus} />
                </button>

                {/* Lesson list (collapsible) */}
                <div
                  id={`module-${mod.slug}`}
                  role="region"
                  aria-label={`${mod.title} lessons`}
                  className={cn(
                    "overflow-hidden transition-all duration-200",
                    isExpanded
                      ? "max-h-[2000px] opacity-100"
                      : "max-h-0 opacity-0",
                  )}
                >
                  <div className="ml-3 border-l border-border/50 pb-1 pl-2">
                    {mod.lessons.map((lesson) => {
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
                          href={`/learn/${pathSlug}/${mod.slug}/${lesson.slug}`}
                          className={cn(
                            "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-all",
                            isCurrent
                              ? "bg-primary/10 font-semibold"
                              : "hover:bg-muted/60",
                          )}
                          aria-current={isCurrent ? "page" : undefined}
                        >
                          <LessonStatusIcon
                            status={status}
                            order={lesson.order}
                          />
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
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with summary */}
        <div className="shrink-0 border-t border-border/60 px-4 py-3">
          <p className="text-[11px] font-medium text-foreground/40">
            {completedLessons.length} of {totalLessons} lessons completed
          </p>
        </div>
      </aside>
    </>
  );
}
