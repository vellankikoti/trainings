interface CalloutProps {
  type?: "info" | "warning" | "tip" | "danger" | "story";
  title?: string;
  children: React.ReactNode;
}

const CALLOUT_STYLES: Record<
  string,
  { border: string; bg: string; icon: string; defaultTitle: string }
> = {
  info: {
    border: "border-blue-500",
    bg: "bg-blue-500/10",
    icon: "ℹ️",
    defaultTitle: "Info",
  },
  warning: {
    border: "border-yellow-500",
    bg: "bg-yellow-500/10",
    icon: "⚠️",
    defaultTitle: "Warning",
  },
  tip: {
    border: "border-green-500",
    bg: "bg-green-500/10",
    icon: "💡",
    defaultTitle: "Tip",
  },
  danger: {
    border: "border-red-500",
    bg: "bg-red-500/10",
    icon: "🚨",
    defaultTitle: "Danger",
  },
  story: {
    border: "border-purple-500",
    bg: "bg-purple-500/10",
    icon: "📖",
    defaultTitle: "Story Time",
  },
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const style = CALLOUT_STYLES[type] || CALLOUT_STYLES.info;

  return (
    <div
      role="note"
      aria-label={title || style.defaultTitle}
      className={`my-4 rounded-lg border-l-4 ${style.border} ${style.bg} p-4`}
    >
      <div className="flex items-center gap-2 font-semibold">
        <span>{style.icon}</span>
        <span>{title || style.defaultTitle}</span>
      </div>
      <div className="mt-2 text-sm">{children}</div>
    </div>
  );
}
