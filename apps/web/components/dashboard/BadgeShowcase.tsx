"use client";

interface BadgeInfo {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  earnedAt: string;
}

interface BadgeShowcaseProps {
  earned: BadgeInfo[];
  totalAvailable: number;
}

export function BadgeShowcase({ earned, totalAvailable }: BadgeShowcaseProps) {
  if (earned.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 p-6 text-center">
        <h3 className="text-sm font-semibold text-muted-foreground">Badges</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete lessons, labs, and maintain streaks to earn badges.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Badges</h3>
        <span className="text-xs text-muted-foreground">
          {earned.length} / {totalAvailable} earned
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {earned.map((badge) => (
          <div
            key={badge.badgeId}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${getTierStyle(badge.tier)}`}
            title={badge.description}
          >
            <BadgeIconSvg name={badge.icon} />
            {badge.name}
          </div>
        ))}
      </div>
    </div>
  );
}

function getTierStyle(tier: string): string {
  switch (tier) {
    case "platinum":
      return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400";
    case "gold":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "silver":
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
    default:
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  }
}

function BadgeIconSvg({ name }: { name: string }) {
  const size = 14;
  const icons: Record<string, React.ReactNode> = {
    flame: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
    zap: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    "book-open": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    terminal: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" x2="20" y1="19" y2="19" />
      </svg>
    ),
    award: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  };

  return <>{icons[name] ?? icons.award}</>;
}
