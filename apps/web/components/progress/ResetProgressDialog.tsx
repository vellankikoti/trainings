"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface ResetProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "module" resets one course, "path" resets entire path */
  scope: "module" | "path";
  pathSlug: string;
  moduleSlug?: string;
  /** Display title for the course/path being reset */
  title: string;
}

type DialogState = "idle" | "confirming" | "resetting" | "done";

interface ResetResult {
  xpRemoved: number;
  newTotalXp: number;
  newLevel: number;
  lessonsReset: number;
  modulesReset: number;
}

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function ResetProgressDialog({
  open,
  onOpenChange,
  scope,
  pathSlug,
  moduleSlug,
  title,
}: ResetProgressDialogProps) {
  const router = useRouter();
  const [state, setState] = useState<DialogState>("idle");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResetResult | null>(null);

  const isConfirmValid = confirmText.trim().toUpperCase() === "RESET";

  const handleReset = useCallback(async () => {
    if (!isConfirmValid) return;

    setState("resetting");
    setError(null);

    const { data, error: apiError } = await api.post<ResetResult>(
      "/api/progress/reset",
      {
        scope,
        pathSlug,
        ...(moduleSlug ? { moduleSlug } : {}),
      },
    );

    if (apiError) {
      setError(apiError);
      setState("confirming");
      return;
    }

    if (data) {
      setResult(data);
      setState("done");
    }
  }, [isConfirmValid, scope, pathSlug, moduleSlug]);

  const handleClose = useCallback(
    (value: boolean) => {
      if (!value) {
        // Reset internal state
        setState("idle");
        setConfirmText("");
        setError(null);
        setResult(null);
        if (state === "done") {
          router.refresh();
        }
      }
      onOpenChange(value);
    },
    [onOpenChange, router, state],
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        {/* ─── Done state ─── */}
        {state === "done" && result ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
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
              Progress Reset Complete
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {result.lessonsReset} lesson{result.lessonsReset !== 1 ? "s" : ""} reset
              {result.xpRemoved > 0 && (
                <>
                  {" "}
                  &middot; {result.xpRemoved} XP removed
                </>
              )}
            </p>

            <button
              type="button"
              onClick={() => handleClose(false)}
              className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
            >
              Start Fresh
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-border/60 bg-gradient-to-br from-destructive/[0.04] to-transparent px-6 pt-6 pb-5">
              <DialogHeader>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-destructive"
                    >
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold">
                      Reset Progress
                    </DialogTitle>
                    <DialogDescription className="mt-0.5 text-xs">
                      {title}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </div>

            {/* Body */}
            <div className="space-y-4 px-6 py-5">
              <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 p-3 dark:border-amber-800/40 dark:bg-amber-500/[0.05]">
                <p className="text-sm text-amber-900/80 dark:text-amber-200/80">
                  <strong>This will:</strong>
                </p>
                <ul className="mt-1.5 space-y-1 text-sm text-amber-900/70 dark:text-amber-200/70">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    Reset all lesson progress to 0%
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    Subtract earned XP from your total
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    Allow you to re-earn XP by completing again
                  </li>
                </ul>
                <p className="mt-2 text-xs text-amber-800/60 dark:text-amber-300/50">
                  Your certificates and streak data will not be affected.
                </p>
              </div>

              <div>
                <label
                  htmlFor="reset-confirm"
                  className="block text-xs font-semibold uppercase tracking-wider text-foreground/60"
                >
                  Type &quot;RESET&quot; to confirm
                </label>
                <input
                  id="reset-confirm"
                  type="text"
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    if (e.target.value.trim().toUpperCase() === "RESET") {
                      setState("confirming");
                    } else {
                      setState("idle");
                    }
                  }}
                  placeholder="RESET"
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono uppercase focus:border-destructive focus:outline-none focus:ring-2 focus:ring-destructive/20"
                  autoComplete="off"
                />
              </div>

              {error && (
                <p className="text-center text-sm text-destructive">{error}</p>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border/60 bg-muted/20 px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleClose(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!isConfirmValid || state === "resetting"}
                  onClick={handleReset}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all",
                    isConfirmValid && state !== "resetting"
                      ? "bg-destructive text-white shadow-sm hover:bg-destructive/90 hover:shadow-md active:scale-[0.98]"
                      : "cursor-not-allowed bg-muted text-muted-foreground",
                  )}
                >
                  {state === "resetting" ? (
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
                      Resetting...
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
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                      Reset Progress
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
