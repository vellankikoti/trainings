import { cn } from "@/lib/utils";

type ProgressBarSize = "sm" | "md" | "lg";

interface ProgressBarProps {
  /** Progress value from 0 to 100 */
  value: number;
  /** Visual size variant */
  size?: ProgressBarSize;
  /** Show percentage label */
  showLabel?: boolean;
  /** Additional class for the outer container */
  className?: string;
  /** Accessible label for screen readers */
  ariaLabel?: string;
}

const SIZE_CLASSES: Record<ProgressBarSize, string> = {
  sm: "h-1",
  md: "h-1.5",
  lg: "h-2.5",
};

function getProgressColor(value: number): string {
  if (value >= 100) return "bg-emerald-500";
  if (value >= 75) return "bg-violet-500";
  if (value >= 50) return "bg-primary";
  if (value >= 25) return "bg-amber-500";
  return "bg-primary";
}

export function ProgressBar({
  value,
  size = "md",
  showLabel = false,
  className,
  ariaLabel = "Progress",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex-1 overflow-hidden rounded-full bg-border/80",
          SIZE_CLASSES[size],
        )}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            getProgressColor(clamped),
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="shrink-0 text-[11px] font-bold tabular-nums text-foreground/50">
          {clamped}%
        </span>
      )}
    </div>
  );
}
