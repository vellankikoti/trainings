import Link from "next/link";
import type { PathProgressSummary } from "@/lib/dashboard";
import { ProgressBar } from "@/components/shared/ProgressBar";

interface PathProgressProps {
  paths: PathProgressSummary[];
}

export function PathProgress({ paths }: PathProgressProps) {
  if (paths.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Learning Paths</h2>
        <Link
          href="/paths"
          className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
        >
          View All
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {paths.map((path) => (
          <Link
            key={path.slug}
            href={`/paths/${path.slug}`}
            className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {path.title}
                </h3>
                <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                  {path.coursesCompleted}/{path.coursesTotal} courses
                </span>
              </div>
              <div className="mt-2">
                <ProgressBar
                  value={path.progress}
                  size="md"
                  showLabel
                  ariaLabel={`${path.title} progress`}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
