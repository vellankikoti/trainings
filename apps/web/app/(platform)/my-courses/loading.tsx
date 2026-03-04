/**
 * Skeleton loading state for My Courses page.
 * Matches the section layout: In Progress, Up Next, Explore.
 */

function Pulse({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-muted ${className ?? ""}`} />
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card p-5 sm:p-6">
      {/* Path badge + difficulty */}
      <div className="flex items-start justify-between">
        <Pulse className="h-5 w-24 rounded-full" />
        <Pulse className="h-5 w-16 rounded-full" />
      </div>
      {/* Title + description */}
      <div className="mt-4 space-y-2">
        <Pulse className="h-5 w-3/4" />
        <Pulse className="h-4 w-full" />
      </div>
      {/* Stats */}
      <div className="mt-4 flex gap-4">
        <Pulse className="h-3.5 w-20" />
        <Pulse className="h-3.5 w-12" />
      </div>
      {/* Progress */}
      <div className="mt-4">
        <Pulse className="h-1.5 w-full rounded-full" />
        <Pulse className="mt-2 h-3 w-28" />
      </div>
      {/* CTA */}
      <Pulse className="mt-5 h-10 w-full rounded-xl" />
    </div>
  );
}

function SectionSkeleton({
  cards = 3,
}: {
  cards?: number;
}) {
  return (
    <section>
      <div className="mb-5">
        <Pulse className="h-7 w-36" />
        <Pulse className="mt-2 h-4 w-56" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function MyCoursesSkeleton() {
  return (
    <div className="space-y-12">
      <SectionSkeleton cards={3} />
      <SectionSkeleton cards={2} />
      <SectionSkeleton cards={3} />
    </div>
  );
}

export default function MyCoursesLoading() {
  return (
    <div className="space-y-8">
      {/* Page header skeleton */}
      <div>
        <Pulse className="h-9 w-48" />
        <Pulse className="mt-3 h-5 w-72" />
      </div>
      <MyCoursesSkeleton />
    </div>
  );
}
