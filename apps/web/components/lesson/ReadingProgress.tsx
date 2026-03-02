"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  const isLessonPage = pathname?.startsWith("/learn/");

  useEffect(() => {
    if (!isLessonPage) return;

    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min(100, Math.round((scrollTop / docHeight) * 100)));
      }
    }

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, [isLessonPage]);

  if (!isLessonPage || progress === 0) return null;

  return (
    <div
      className="h-[2px] bg-primary transition-[width] duration-200 ease-out"
      style={{ width: `${progress}%` }}
    />
  );
}
