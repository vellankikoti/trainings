"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LearningHeader } from "@/components/layout/LearningHeader";
import {
  LearningSidebar,
  type SidebarModule,
} from "@/components/learn/LearningSidebar";

const SIDEBAR_STORAGE_KEY = "lms-sidebar-open";

interface LearningShellProps {
  pathSlug: string;
  pathTitle: string;
  modules: SidebarModule[];
  completedLessons: string[];
  courseProgress: number;
  children: React.ReactNode;
}

/**
 * Client wrapper for the learning layout.
 * Manages sidebar open/close state and renders the header + sidebar + content.
 */
export function LearningShell({
  pathSlug,
  pathTitle,
  modules,
  completedLessons,
  courseProgress,
  children,
}: LearningShellProps) {
  // Sidebar state with localStorage persistence
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore sidebar state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored !== null) {
      setIsSidebarOpen(stored === "true");
    }
    setIsHydrated(true);
  }, []);

  // Persist sidebar state
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

  // Derive current module and lesson from pathname
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  // URL: /learn/[path]/[module]/[lesson]
  // segments: ["learn", pathSlug, moduleSlug, lessonSlug]
  const currentModuleSlug = segments[2] ?? "";
  const currentLessonSlug = segments[3] ?? "";

  return (
    <div className="flex min-h-screen flex-col">
      <LearningHeader
        backHref={`/paths/${pathSlug}`}
        courseTitle={pathTitle}
        progress={courseProgress}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1">
        {/* Sidebar — rendered only after hydration to avoid flash */}
        {isHydrated && (
          <LearningSidebar
            pathSlug={pathSlug}
            pathTitle={pathTitle}
            modules={modules}
            currentModuleSlug={currentModuleSlug}
            currentLessonSlug={currentLessonSlug}
            completedLessons={completedLessons}
            courseProgress={courseProgress}
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
          />
        )}

        {/* Main content area */}
        <main
          id="main-content"
          className="min-w-0 flex-1"
          role="main"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
