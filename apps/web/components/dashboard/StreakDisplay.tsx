"use client";

import type { DashboardStats, ActivityDay } from "@/lib/dashboard";

const MILESTONES = [7, 14, 30, 60, 100, 200, 365] as const;

interface StreakRecovery {
  streakBroken: boolean;
  daysSinceLast: number;
  canFreeze: boolean;
}

interface StreakDisplayProps {
  stats: DashboardStats;
  activityDays: ActivityDay[];
  streakRecovery?: StreakRecovery;
}

export function StreakDisplay({ stats, activityDays, streakRecovery }: StreakDisplayProps) {
  const { currentStreak, longestStreak } = stats;

  // Build last 7 days activity map
  const activityMap = new Map<string, boolean>();
  for (const day of activityDays) {
    activityMap.set(day.date, day.lessonsCompleted > 0 || day.xpEarned > 0);
  }

  const last7Days: { date: string; label: string; active: boolean }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    last7Days.push({
      date: dateStr,
      label: i === 0 ? "Today" : dayNames[d.getDay()],
      active: activityMap.get(dateStr) ?? false,
    });
  }

  // Next milestone
  const nextMilestone = MILESTONES.find((m) => m > currentStreak) ?? null;
  const milestoneProgress = nextMilestone
    ? Math.round((currentStreak / nextMilestone) * 100)
    : 100;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Streak</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Best: {longestStreak} days</span>
        </div>
      </div>

      {/* Main streak display */}
      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`text-4xl font-bold tabular-nums ${currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"}`}>
            {currentStreak}
          </div>
          <div className="text-sm text-muted-foreground">
            day{currentStreak !== 1 ? "s" : ""}
          </div>
        </div>
        {currentStreak > 0 && (
          <FlameIcon className="h-8 w-8 text-orange-500" />
        )}
      </div>

      {/* Weekly activity dots */}
      <div className="mt-4 flex items-center gap-1.5">
        {last7Days.map((day) => (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                day.active
                  ? "bg-emerald-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
              title={`${day.date}: ${day.active ? "Active" : "Inactive"}`}
            >
              {day.active ? "✓" : ""}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {day.label}
            </span>
          </div>
        ))}
      </div>

      {/* Streak recovery info */}
      {streakRecovery?.streakBroken && currentStreak === 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/50 dark:bg-amber-950/30">
          <div className="flex items-start gap-2">
            <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-sm">
              {streakRecovery.canFreeze ? (
                <>
                  <p className="font-medium text-amber-800 dark:text-amber-300">
                    Streak freeze available
                  </p>
                  <p className="mt-0.5 text-amber-700 dark:text-amber-400/80">
                    You missed 1 day. Complete a lesson now to restore your streak.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-amber-800 dark:text-amber-300">
                    Streak lost — {streakRecovery.daysSinceLast} day{streakRecovery.daysSinceLast !== 1 ? "s" : ""} inactive
                  </p>
                  <p className="mt-0.5 text-amber-700 dark:text-amber-400/80">
                    {longestStreak > 0
                      ? `Your best was ${longestStreak} days. Start a new streak today!`
                      : "Complete a lesson to start a new streak!"}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Next milestone */}
      {nextMilestone && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Next milestone: {nextMilestone} days</span>
            <span>
              {currentStreak}/{nextMilestone}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-orange-500 transition-all"
              style={{ width: `${milestoneProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Earned milestones */}
      {currentStreak >= 7 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MILESTONES.filter((m) => currentStreak >= m).map((m) => (
            <span
              key={m}
              className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
            >
              {m}d
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
