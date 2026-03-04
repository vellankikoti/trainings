"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/shared/ProgressBar";

interface PathProgressOverlayProps {
  pathSlug: string;
  firstLessonHref: string;
}

interface ProgressData {
  percentage: number;
  modulesCompleted: number;
  modulesTotal: number;
  completedLessons: string[];
  resumeHref: string | null;
}

/**
 * Shared cache for path-summary data.
 * Both PathProgressOverlay and useCompletedLessons read from here
 * so only ONE fetch is made per pathSlug per mount cycle.
 */
const fetchCache = new Map<
  string,
  { promise: Promise<ProgressData | null>; data: ProgressData | null }
>();

function fetchPathSummary(pathSlug: string): Promise<ProgressData | null> {
  const existing = fetchCache.get(pathSlug);
  if (existing) return existing.promise;

  const promise = fetch(
    `/api/progress/path-summary?path=${encodeURIComponent(pathSlug)}`,
  )
    .then((res) => {
      if (!res.ok) return null;
      return res.json() as Promise<ProgressData>;
    })
    .then((json) => {
      const entry = fetchCache.get(pathSlug);
      if (entry) entry.data = json;
      return json;
    })
    .catch(() => null);

  fetchCache.set(pathSlug, { promise, data: null });

  // Auto-expire cache entry after 30 seconds to allow refetch on re-navigation
  setTimeout(() => fetchCache.delete(pathSlug), 30_000);

  return promise;
}

export function PathProgressOverlay({
  pathSlug,
  firstLessonHref,
}: PathProgressOverlayProps) {
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    fetchPathSummary(pathSlug).then((json) => {
      if (json) setData(json);
    });
  }, [pathSlug]);

  if (!data || data.percentage === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your Progress
          </p>
          <div className="mt-2">
            <ProgressBar
              value={data.percentage}
              size="md"
              showLabel
              ariaLabel={`Path progress: ${data.percentage}%`}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {data.modulesCompleted} of {data.modulesTotal} modules completed
          </p>
        </div>
        {data.resumeHref && (
          <Link
            href={data.resumeHref}
            className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Continue
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Provides completed lesson slugs to the parent via context/callback.
 * Uses the same shared fetch cache as PathProgressOverlay — no duplicate request.
 */
export function useCompletedLessons(pathSlug: string): Set<string> {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPathSummary(pathSlug).then((json) => {
      if (json?.completedLessons) {
        setCompleted(new Set(json.completedLessons));
      }
    });
  }, [pathSlug]);

  return completed;
}
