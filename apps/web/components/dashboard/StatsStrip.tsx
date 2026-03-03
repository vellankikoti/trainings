import type { DashboardStats } from "@/lib/dashboard";
import { ProgressBar } from "@/components/shared/ProgressBar";

interface StatsStripProps {
  stats: DashboardStats;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  detail?: React.ReactNode;
}

function StatCard({ label, value, icon, detail }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {value}
          </p>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>
      </div>
      {detail && <div className="mt-3">{detail}</div>}
    </div>
  );
}

export function StatsStrip({ stats }: StatsStripProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label={stats.levelTitle}
        value={`Lv ${stats.level}`}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" />
            <circle cx="17" cy="7" r="5" />
          </svg>
        }
        detail={
          <ProgressBar
            value={stats.levelProgress}
            size="sm"
            ariaLabel={`Level ${stats.level} progress: ${stats.levelProgress}%`}
          />
        }
      />

      <StatCard
        label="Total XP"
        value={stats.totalXp.toLocaleString()}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        }
      />

      <StatCard
        label="Day Streak"
        value={stats.currentStreak}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
        }
      />

      <StatCard
        label="Lessons Done"
        value={stats.totalLessonsCompleted}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
          </svg>
        }
      />
    </div>
  );
}
