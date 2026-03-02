interface CalloutProps {
  type?: "info" | "warning" | "tip" | "danger" | "story" | "best-practice" | "real-world";
  title?: string;
  children: React.ReactNode;
}

const CALLOUT_CONFIG: Record<
  string,
  {
    border: string;
    bg: string;
    iconBg: string;
    iconColor: string;
    titleColor: string;
    defaultTitle: string;
    icon: React.ReactNode;
  }
> = {
  info: {
    border: "border-blue-500/40",
    bg: "bg-blue-500/5",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-600 dark:text-blue-400",
    titleColor: "text-blue-700 dark:text-blue-300",
    defaultTitle: "Info",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
  },
  warning: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/5",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-600 dark:text-amber-400",
    titleColor: "text-amber-700 dark:text-amber-300",
    defaultTitle: "Warning",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    ),
  },
  tip: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/5",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    titleColor: "text-emerald-700 dark:text-emerald-300",
    defaultTitle: "Tip",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      </svg>
    ),
  },
  danger: {
    border: "border-red-500/40",
    bg: "bg-red-500/5",
    iconBg: "bg-red-500/15",
    iconColor: "text-red-600 dark:text-red-400",
    titleColor: "text-red-700 dark:text-red-300",
    defaultTitle: "Danger",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
    ),
  },
  story: {
    border: "border-violet-500/40",
    bg: "bg-violet-500/5",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-600 dark:text-violet-400",
    titleColor: "text-violet-700 dark:text-violet-300",
    defaultTitle: "Story Time",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      </svg>
    ),
  },
  "best-practice": {
    border: "border-teal-500/40",
    bg: "bg-teal-500/5",
    iconBg: "bg-teal-500/15",
    iconColor: "text-teal-600 dark:text-teal-400",
    titleColor: "text-teal-700 dark:text-teal-300",
    defaultTitle: "Best Practice",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  "real-world": {
    border: "border-orange-500/40",
    bg: "bg-orange-500/5",
    iconBg: "bg-orange-500/15",
    iconColor: "text-orange-600 dark:text-orange-400",
    titleColor: "text-orange-700 dark:text-orange-300",
    defaultTitle: "Real-World",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const config = CALLOUT_CONFIG[type] || CALLOUT_CONFIG.info;

  return (
    <div
      role="note"
      aria-label={title || config.defaultTitle}
      className={`not-prose my-6 rounded-xl border-l-4 ${config.border} ${config.bg} p-5`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.iconBg} ${config.iconColor}`}>
          {config.icon}
        </div>
        <span className={`text-sm font-bold uppercase tracking-wide ${config.titleColor}`}>
          {title || config.defaultTitle}
        </span>
      </div>
      <div className="mt-3 text-[0.938rem] leading-relaxed text-foreground/90 [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mt-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:mt-2 [&>ol]:list-decimal [&>ol]:pl-5 [&_code]:rounded-md [&_code]:bg-foreground/[0.06] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-medium">
        {children}
      </div>
    </div>
  );
}
