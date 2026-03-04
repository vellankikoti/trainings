export default function AdminLoading() {
  return (
    <div className="max-w-6xl space-y-6">
      {/* Title skeleton */}
      <div className="h-9 w-56 animate-pulse rounded-lg bg-muted" />
      <div className="h-5 w-72 animate-pulse rounded bg-muted" />

      {/* Stats grid skeleton */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border p-6"
          >
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="h-48 animate-pulse rounded-lg border border-border bg-muted/30" />
    </div>
  );
}
