"use client";

import { useCallback, useEffect, useState } from "react";
import { CourseHeader } from "@/components/learn/CourseHeader";
import { CourseSidebar, type CourseLessonRef } from "@/components/learn/CourseSidebar";

const SIDEBAR_STORAGE_KEY = "lms-sidebar-open";

interface CourseShellProps {
  pathSlug: string;
  pathTitle: string;
  moduleSlug: string;
  courseTitle: string;
  lessons: CourseLessonRef[];
  completedLessons: string[];
  courseProgress: number;
  totalLessons: number;
  completedCount: number;
  children: React.ReactNode;
}

/**
 * Client wrapper for the COURSE layout.
 * Manages sidebar state and renders CourseHeader + CourseSidebar + content.
 *
 * Scope: ONE course (module). No path modules, no path switching.
 */
export function CourseShell({
  pathSlug,
  pathTitle,
  moduleSlug,
  courseTitle,
  lessons,
  completedLessons,
  courseProgress,
  totalLessons,
  completedCount,
  children,
}: CourseShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore sidebar state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored !== null) {
      setIsSidebarOpen(stored === "true");
    }
    setIsHydrated(true);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, "false");
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <CourseHeader
        pathSlug={pathSlug}
        pathTitle={pathTitle}
        courseTitle={courseTitle}
        courseProgress={courseProgress}
        totalLessons={totalLessons}
        completedLessons={completedCount}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1">
        {isHydrated && (
          <CourseSidebar
            pathSlug={pathSlug}
            pathTitle={pathTitle}
            moduleSlug={moduleSlug}
            courseTitle={courseTitle}
            lessons={lessons}
            completedLessons={completedLessons}
            courseProgress={courseProgress}
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
          />
        )}

        <main id="main-content" className="min-w-0 flex-1" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
