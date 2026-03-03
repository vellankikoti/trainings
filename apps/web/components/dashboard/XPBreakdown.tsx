import { xpToNextLevel, LEVELS } from "@/lib/levels";
import type { DashboardStats } from "@/lib/dashboard";
import { ProgressBar } from "@/components/shared/ProgressBar";

interface XPHistoryEntry {
  amount: number;
  source: string;
  sourceId: string | null;
  createdAt: string;
}

interface XPBreakdownProps {
  stats: DashboardStats;
  history: XPHistoryEntry[];
}

const SOURCE_LABELS: Record<string, string> = {
  lesson_complete: "Lesson",
  exercise_complete: "Exercise",
  quiz_pass: "Quiz Pass",
  quiz_perfect: "Perfect Quiz",
  quiz_complete: "Quiz",
  module_complete: "Course Done",
  path_complete: "Path Done",
  daily_streak: "Streak",
  streak_milestone: "Milestone",
  badge_earned: "Badge",
  lab_complete_t1: "Lab",
  lab_complete_t2: "Lab",
  lab_complete_t3: "Lab",
  simulation_resolved: "Simulation",
  simulation_excellent: "Simulation",
};

function getSourceLabel(source: string): string {
  return (
    SOURCE_LABELS[source] ??
    source
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
  );
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function XPBreakdown({ stats, history }: XPBreakdownProps) {
  const xpNeeded = xpToNextLevel(stats.totalXp);
  const nextLevel = stats.level < 10 ? LEVELS[stats.level] : null;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">XP Progress</h3>
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {stats.totalXp.toLocaleString()} XP
        </span>
      </div>

      {/* Level progress */}
      {nextLevel && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">
              Lv {stats.level} {stats.levelTitle}
            </span>
            <span className="text-muted-foreground">
              Lv {nextLevel.level} {nextLevel.title}
            </span>
          </div>
          <div className="mt-1.5">
            <ProgressBar
              value={stats.levelProgress}
              size="sm"
              ariaLabel={`${stats.levelProgress}% to level ${nextLevel.level}`}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {xpNeeded.toLocaleString()} XP to next level
          </p>
        </div>
      )}

      {stats.level >= 10 && (
        <div className="mt-4 rounded-lg bg-primary/5 p-3 text-center">
          <p className="text-sm font-semibold text-primary">Max Level Reached</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Distinguished Engineer
          </p>
        </div>
      )}

      {/* Recent XP history */}
      {history.length > 0 && (
        <div className="mt-5">
          <h4 className="text-xs font-medium text-muted-foreground">
            Recent Activity
          </h4>
          <div className="mt-2 space-y-2">
            {history.slice(0, 8).map((entry, i) => (
              <div
                key={`${entry.createdAt}-${i}`}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="truncate text-foreground">
                    {getSourceLabel(entry.source)}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-semibold tabular-nums text-primary">
                    +{entry.amount}
                  </span>
                  <span className="w-14 text-right text-xs text-muted-foreground">
                    {getRelativeTime(entry.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length === 0 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Complete lessons to earn XP and level up.
        </p>
      )}
    </div>
  );
}
