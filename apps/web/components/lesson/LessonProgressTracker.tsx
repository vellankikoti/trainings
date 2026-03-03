"use client";

import { useEffect, useRef } from "react";

interface LessonProgressTrackerProps {
  pathSlug: string;
  moduleSlug: string;
  lessonSlug: string;
  /** Skip tracking if user is not authenticated or lesson is already completed */
  skip?: boolean;
}

/**
 * Silently marks a lesson as "in_progress" when the user visits it.
 * Fires once per mount, non-blocking, error-swallowed.
 */
export function LessonProgressTracker({
  pathSlug,
  moduleSlug,
  lessonSlug,
  skip = false,
}: LessonProgressTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (skip || tracked.current) return;
    tracked.current = true;

    fetch("/api/progress/lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pathSlug,
        moduleSlug,
        lessonSlug,
        status: "in_progress",
      }),
    }).catch(() => {
      // Silently fail — progress tracking is non-critical
    });
  }, [pathSlug, moduleSlug, lessonSlug, skip]);

  return null;
}
