/**
 * Skeleton loading states for dashboard sections.
 * Used as Suspense fallbacks while data loads.
 */

function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ""}`} />;
}

export function ContinueLearningSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 shadow-[var(--shadow-sm)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <Pulse className="h-3 w-28" />
          <Pulse className="h-6 w-48" />
          <Pulse className="h-4 w-36" />
          <Pulse className="mt-1 h-2 w-64 max-w-xs" />
        </div>
        <Pulse className="h-11 w-28 shrink-0 rounded-lg" />
      </div>
    </div>
  );
}

export function RecommendedNextSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[var(--shadow-sm)]">
      <Pulse className="h-3 w-32" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg p-3">
            <Pulse className="h-8 w-8 shrink-0 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <Pulse className="h-4 w-36" />
              <Pulse className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsStripSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/60 bg-card p-5 shadow-[var(--shadow-sm)]"
        >
          <div className="flex items-center gap-3">
            <Pulse className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="space-y-2">
              <Pulse className="h-6 w-16" />
              <Pulse className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StreakSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between">
        <Pulse className="h-5 w-16" />
        <Pulse className="h-4 w-24" />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <Pulse className="h-10 w-16" />
      </div>
      <div className="mt-4 flex items-center gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <Pulse className="h-8 w-8 rounded-full" />
            <Pulse className="h-2 w-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CoursesSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[var(--shadow-sm)] lg:col-span-2">
      <Pulse className="mb-4 h-5 w-24" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Pulse className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-4 w-40" />
              <Pulse className="h-2 w-full max-w-[200px]" />
            </div>
            <Pulse className="h-4 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BadgesSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[var(--shadow-sm)]">
      <Pulse className="mb-4 h-5 w-20" />
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Pulse key={i} className="h-14 w-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function HeatmapSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[var(--shadow-sm)]">
      <Pulse className="mb-4 h-5 w-32" />
      <div className="flex gap-0.5">
        {Array.from({ length: 26 }).map((_, col) => (
          <div key={col} className="flex flex-col gap-0.5">
            {Array.from({ length: 7 }).map((_, row) => (
              <Pulse key={row} className="h-2.5 w-2.5 rounded-sm" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function BottomGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/60 bg-card p-5 shadow-[var(--shadow-sm)]"
        >
          <Pulse className="mb-4 h-5 w-28" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <Pulse className="h-4 w-4 rounded" />
                <Pulse className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Full-page dashboard skeleton */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Pulse className="h-8 w-64" />
        <Pulse className="mt-2 h-4 w-48" />
      </div>
      <ContinueLearningSkeleton />
      <RecommendedNextSkeleton />
      <StatsStripSkeleton />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <StreakSkeleton />
        <CoursesSkeleton />
      </div>
      <BadgesSkeleton />
      <HeatmapSkeleton />
      <BottomGridSkeleton />
    </div>
  );
}
