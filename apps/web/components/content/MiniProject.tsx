interface MiniProjectProps {
  title: string;
  difficulty?: string;
  xpReward?: number;
  estimatedMinutes?: number;
  objectives?: string[];
  hints?: string[];
  validationCriteria?: string[];
  children: React.ReactNode;
}

export function MiniProject({ title, difficulty, xpReward, estimatedMinutes, children }: MiniProjectProps) {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      {/* Header with gradient left border */}
      <div className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Hands-On Project
              </p>
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
            </div>
          </div>

          {/* Meta badges */}
          {(difficulty || xpReward || estimatedMinutes) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 pl-[3.25rem]">
              {difficulty && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
              )}
              {xpReward && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  {xpReward} XP
                </span>
              )}
              {estimatedMinutes && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {estimatedMinutes} min
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="border-t border-border/40 p-5 text-[0.938rem] leading-relaxed [&>p]:mb-3 [&>p:last-child]:mb-0 [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>pre]:my-3 [&>pre]:rounded-lg">
        {children}
      </div>
    </div>
  );
}
