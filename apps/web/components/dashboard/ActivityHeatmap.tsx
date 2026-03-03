"use client";

import type { ActivityDay } from "@/lib/dashboard";

/**
 * A simple activity heatmap showing the last 90 days of activity.
 * Each day is color-coded based on XP earned.
 */
export function ActivityHeatmap({ data }: { data: ActivityDay[] }) {
  // Build a map of date -> activity for quick lookup
  const activityMap = new Map<string, ActivityDay>();
  for (const day of data) {
    activityMap.set(day.date, day);
  }

  // Generate last 90 days
  const days: { date: string; level: number }[] = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const activity = activityMap.get(dateStr);
    const level = getActivityLevel(activity);
    days.push({ date: dateStr, level });
  }

  // Group into weeks (columns of 7)
  const weeks: (typeof days)[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const activeDays = data.length;
  const totalXP = data.reduce((sum, d) => sum + d.xpEarned, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Activity</h3>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>{activeDays} active days</span>
          <span>{totalXP.toLocaleString()} XP earned</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`h-3 w-3 rounded-sm ${getLevelColor(day.level)}`}
                  title={`${day.date}: ${activityMap.get(day.date)?.xpEarned ?? 0} XP`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-3 w-3 rounded-sm ${getLevelColor(level)}`}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

function getActivityLevel(activity?: ActivityDay): number {
  if (!activity) return 0;
  const xp = activity.xpEarned;
  if (xp >= 200) return 4;
  if (xp >= 100) return 3;
  if (xp >= 50) return 2;
  if (xp > 0) return 1;
  return 0;
}

function getLevelColor(level: number): string {
  switch (level) {
    case 0:
      return "bg-muted";
    case 1:
      return "bg-emerald-200 dark:bg-emerald-900";
    case 2:
      return "bg-emerald-400 dark:bg-emerald-700";
    case 3:
      return "bg-emerald-500 dark:bg-emerald-500";
    case 4:
      return "bg-emerald-600 dark:bg-emerald-400";
    default:
      return "bg-muted";
  }
}
