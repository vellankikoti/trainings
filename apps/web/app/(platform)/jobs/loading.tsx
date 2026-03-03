export default function JobBoardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 animate-pulse rounded bg-muted" />
      <div className="h-12 w-full animate-pulse rounded-lg bg-muted/30" />
      <div className="grid gap-3 md:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-lg border border-border bg-muted/30"
          />
        ))}
      </div>
    </div>
  );
}
