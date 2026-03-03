"use client";

import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface CompletionReflectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonTitle: string;
  keyTakeaways?: string[];
  reflectionPrompt?: string;
  xpReward: number;
  /** Called when the user confirms completion inside the modal */
  onConfirm: () => Promise<void>;
}

type ModalState = "reflecting" | "confirming" | "completed";

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function CompletionReflectionModal({
  open,
  onOpenChange,
  lessonTitle,
  keyTakeaways,
  reflectionPrompt,
  xpReward,
  onConfirm,
}: CompletionReflectionModalProps) {
  const [state, setState] = useState<ModalState>("reflecting");
  const [error, setError] = useState<string | null>(null);

  const hasTakeaways = keyTakeaways && keyTakeaways.length > 0;
  const hasReflection = !!reflectionPrompt;

  const handleConfirm = useCallback(async () => {
    setState("confirming");
    setError(null);
    try {
      await onConfirm();
      setState("completed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("reflecting");
    }
  }, [onConfirm]);

  const handleClose = useCallback(
    (value: boolean) => {
      if (!value) {
        // Reset state when closing
        setState("reflecting");
        setError(null);
      }
      onOpenChange(value);
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md overflow-hidden p-0 sm:max-w-lg">
        {/* ─── Completed state ─── */}
        {state === "completed" ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            {/* Success icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-500"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>

            <h3 className="mt-5 text-xl font-bold text-foreground">
              Lesson Complete!
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Great work finishing this lesson.
            </p>

            {/* XP badge */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span className="text-sm font-bold text-primary">
                +{xpReward} XP earned
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleClose(false)}
              className="mt-6 rounded-xl bg-foreground px-6 py-3 text-sm font-bold text-background transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Continue Learning
            </button>
          </div>
        ) : (
          /* ─── Reflection state ─── */
          <>
            {/* Header with gradient accent */}
            <div className="relative border-b border-border/60 bg-gradient-to-br from-primary/[0.04] to-transparent px-6 pt-6 pb-5">
              <DialogHeader>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold">
                      Ready to complete this lesson?
                    </DialogTitle>
                    <DialogDescription className="mt-0.5 text-xs">
                      {lessonTitle}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </div>

            {/* Body */}
            <div className="space-y-5 px-6 py-5">
              {/* Key Takeaways */}
              {hasTakeaways && (
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground/60">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2v4" />
                      <path d="m6.343 6.343-1.414-1.414" />
                      <path d="M2 12h4" />
                      <path d="m17.657 6.343 1.414-1.414" />
                      <path d="M22 12h-4" />
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 22v-4" />
                    </svg>
                    Key Takeaways
                  </h4>
                  <div className="mt-3 space-y-2">
                    {keyTakeaways!.map((takeaway, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5 shrink-0 text-primary"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <span className="text-sm leading-snug text-foreground/90">
                          {takeaway}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reflection prompt */}
              {hasReflection && (
                <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 dark:border-amber-800/40 dark:bg-amber-500/[0.05]">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <path d="M12 17h.01" />
                    </svg>
                    Reflect
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-amber-900/80 dark:text-amber-200/80">
                    {reflectionPrompt}
                  </p>
                </div>
              )}

              {/* No takeaways fallback — minimal confirmation */}
              {!hasTakeaways && !hasReflection && (
                <p className="text-center text-sm text-muted-foreground">
                  Confirm you&apos;ve finished this lesson to earn your XP and track your progress.
                </p>
              )}

              {/* Error */}
              {error && (
                <p className="text-center text-sm text-destructive">{error}</p>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border/60 bg-muted/20 px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <span className="font-semibold">+{xpReward} XP</span>
                </div>
                <button
                  type="button"
                  disabled={state === "confirming"}
                  onClick={handleConfirm}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all",
                    state === "confirming"
                      ? "cursor-not-allowed bg-muted text-muted-foreground"
                      : "bg-primary text-white shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-[0.98]",
                  )}
                >
                  {state === "confirming" ? (
                    <>
                      <svg
                        className="size-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Completing...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      Confirm Completion
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
