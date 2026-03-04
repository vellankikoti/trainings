export default function LearnLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Header skeleton */}
        <div className="text-center">
          <div className="mx-auto h-10 w-56 animate-pulse rounded-lg bg-muted" />
          <div className="mx-auto mt-4 h-5 w-96 max-w-full animate-pulse rounded-lg bg-muted" />
        </div>

        {/* Grid skeleton */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col rounded-xl border border-border bg-card shadow-sm"
            >
              <div className="flex flex-1 flex-col p-6">
                {/* Icon */}
                <div className="h-8 w-8 animate-pulse rounded bg-muted" />

                {/* Title */}
                <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-muted" />

                {/* Description lines */}
                <div className="mt-2 space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                </div>

                {/* Module count */}
                <div className="mt-4 h-3 w-20 animate-pulse rounded bg-muted" />
              </div>

              {/* Progress footer */}
              <div className="border-t border-border/40 px-6 py-3">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
