import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────

export interface RoadmapModule {
  slug: string;
  title: string;
  lessonsCount: number;
  completedLessons: number;
  status: "completed" | "in_progress" | "not_started";
}

export interface RoadmapPath {
  slug: string;
  title: string;
  color: string;
  difficulty: string;
  progress: number;
  modules: RoadmapModule[];
}

interface SkillRoadmapProps {
  paths: RoadmapPath[];
}

// ── Status indicator ─────────────────────────────────────────────────────────

function StatusDot({ status }: { status: RoadmapModule["status"] }) {
  if (status === "completed") {
    return (
      <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-card">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
    );
  }

  if (status === "in_progress") {
    return (
      <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[3px] border-primary bg-card ring-4 ring-card">
        <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
      </div>
    );
  }

  return (
    <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card ring-4 ring-card">
      <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
    </div>
  );
}

// ── Difficulty badge ─────────────────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    advanced: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
        colors[difficulty] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {difficulty}
    </span>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function SkillRoadmap({ paths }: SkillRoadmapProps) {
  if (paths.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Learning Roadmap
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your journey from beginner to production-ready
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-1">
        {paths.map((path, pathIdx) => {
          const completedModules = path.modules.filter(
            (m) => m.status === "completed",
          ).length;
          const hasProgress = path.modules.some(
            (m) => m.status !== "not_started",
          );

          return (
            <div key={path.slug}>
              {/* Path header */}
              <div className="flex items-center gap-3 py-2">
                <div
                  className="h-3.5 w-3.5 rounded-full ring-2 ring-card"
                  style={{ backgroundColor: path.color }}
                />
                <Link
                  href={`/paths/${path.slug}`}
                  className="text-sm font-bold text-foreground transition-colors hover:text-primary"
                >
                  {path.title}
                </Link>
                <DifficultyBadge difficulty={path.difficulty} />
                {hasProgress && (
                  <span className="ml-auto text-xs font-medium tabular-nums text-muted-foreground">
                    {completedModules}/{path.modules.length} courses
                  </span>
                )}
              </div>

              {/* Module nodes with vertical line */}
              <div className="relative ml-[6px]">
                {/* Vertical connector line */}
                <div className="absolute bottom-0 left-[12px] top-0 w-0.5 bg-border" />

                {path.modules.map((mod) => (
                  <div
                    key={mod.slug}
                    className="relative flex items-start gap-3 py-1.5"
                  >
                    <StatusDot status={mod.status} />
                    <div className="min-w-0 pt-0.5">
                      <Link
                        href={`/learn/${path.slug}/${mod.slug}`}
                        className={`text-sm font-medium transition-colors hover:text-primary ${
                          mod.status === "completed"
                            ? "text-muted-foreground"
                            : mod.status === "in_progress"
                              ? "text-foreground"
                              : "text-muted-foreground/60"
                        }`}
                      >
                        {mod.title}
                      </Link>
                      <p className="text-[11px] tabular-nums text-muted-foreground/70">
                        {mod.completedLessons}/{mod.lessonsCount} lessons
                        {mod.status === "completed" && (
                          <span className="ml-2 text-emerald-600 dark:text-emerald-400">
                            Complete
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dashed connector between paths */}
              {pathIdx < paths.length - 1 && (
                <div className="relative ml-[6px] h-5">
                  <div className="absolute left-[12px] top-0 h-full w-0.5 border-l-2 border-dashed border-border/60" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
