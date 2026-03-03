"use client";

import { useState, useCallback, useEffect } from "react";
import { XTerminal } from "./XTerminal";

// ── Types ────────────────────────────────────────────────────────────────────

interface Exercise {
  id: string;
  title: string;
  description: string;
  hints: string[];
}

interface LabSessionState {
  sessionId: string;
  status: string;
  wsUrl: string | null;
  labType: string;
  exercisesCompleted: string[];
}

export interface LabTerminalProps {
  labId: string;
  labTitle: string;
  exercises: Exercise[];
  duration: number;
}

// ── Component ────────────────────────────────────────────────────────────────

export function LabTerminal({
  labId,
  labTitle,
  exercises,
  duration,
}: LabTerminalProps) {
  const [session, setSession] = useState<LabSessionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [activeExercise, setActiveExercise] = useState(0);
  const [hintsRevealed, setHintsRevealed] = useState<Record<string, number>>(
    {},
  );
  const [validating, setValidating] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // ── Timer ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!session || session.status !== "running") return;

    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  // ── Check for existing session on mount ────────────────────────────────────

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/labs/session");
        const data = await res.json();
        if (data.sessionId && data.labType === labId) {
          setSession({
            sessionId: data.sessionId,
            status: data.status,
            wsUrl: data.wsUrl ?? null,
            labType: data.labType,
            exercisesCompleted: data.exercisesCompleted ?? [],
          });
        }
      } catch {
        // No existing session
      }
    }

    checkSession();
  }, [labId]);

  // ── Start session ──────────────────────────────────────────────────────────

  const startSession = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/labs/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labType: labId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to start lab session");
        return;
      }

      setSession({
        sessionId: data.sessionId,
        status: data.status,
        wsUrl: data.wsUrl ?? null,
        labType: data.labType,
        exercisesCompleted: [],
      });
      setElapsedSeconds(0);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [labId]);

  // ── Stop session ───────────────────────────────────────────────────────────

  const stopSession = useCallback(async () => {
    if (!session) return;

    try {
      await fetch(`/api/labs/${session.sessionId}`, { method: "DELETE" });
    } catch {
      // Best effort
    }

    setSession(null);
    setConnected(false);
    setElapsedSeconds(0);
  }, [session]);

  // ── Validate exercise ──────────────────────────────────────────────────────

  const validateExercise = useCallback(
    async (exerciseId: string) => {
      if (!session) return;
      setValidating(exerciseId);

      try {
        const res = await fetch(
          `/api/labs/${session.sessionId}/validate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exerciseId }),
          },
        );

        const data = await res.json();

        if (data.passed) {
          setSession((s) =>
            s
              ? {
                  ...s,
                  exercisesCompleted: [
                    ...new Set([...s.exercisesCompleted, exerciseId]),
                  ],
                }
              : null,
          );

          // Auto-advance to next incomplete exercise
          const nextIncomplete = exercises.findIndex(
            (ex) =>
              ex.id !== exerciseId &&
              !session.exercisesCompleted.includes(ex.id),
          );
          if (nextIncomplete !== -1) {
            setActiveExercise(nextIncomplete);
          }
        } else {
          setError("Validation failed. Keep trying!");
        }
      } catch {
        setError("Failed to validate exercise.");
      } finally {
        setValidating(null);
      }
    },
    [session, exercises],
  );

  // ── Reveal hint ────────────────────────────────────────────────────────────

  const revealHint = useCallback((exerciseId: string) => {
    setHintsRevealed((prev) => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] ?? 0) + 1,
    }));
  }, []);

  // ── Format time ────────────────────────────────────────────────────────────

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  const completedCount = session?.exercisesCompleted.length ?? 0;
  const totalCount = exercises.length;
  const allCompleted = completedCount === totalCount;

  // ── Pre-session view ───────────────────────────────────────────────────────

  if (!session) {
    return (
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 bg-muted/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Hands-on Lab
              </p>
              <h3 className="text-base font-bold text-foreground">
                {labTitle}
              </h3>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
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
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {duration} min
            </span>
            <span className="flex items-center gap-1.5">
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
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {totalCount} exercises
            </span>
          </div>

          {/* Exercise preview list */}
          <div className="space-y-2">
            {exercises.map((ex, i) => (
              <div
                key={ex.id}
                className="flex items-start gap-3 rounded-lg border border-border/40 p-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {ex.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ex.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={startSession}
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Starting Lab..." : "Start Lab Environment"}
          </button>
        </div>
      </div>
    );
  }

  // ── Active session view ────────────────────────────────────────────────────

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/60 bg-[#0f1419] px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="font-mono text-xs text-[hsl(215,16%,50%)]">
            {labTitle}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              connected
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            {connected ? "Connected" : "Connecting..."}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs tabular-nums text-[hsl(215,16%,50%)]">
            {formatTime(elapsedSeconds)}
          </span>
          <span className="font-mono text-xs tabular-nums text-emerald-400">
            {completedCount}/{totalCount}
          </span>
          <button
            onClick={stopSession}
            className="rounded px-2 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            Stop
          </button>
        </div>
      </div>

      {/* Main content: terminal + exercise sidebar */}
      <div className="flex" style={{ height: "480px" }}>
        {/* Terminal */}
        <div className="flex-1">
          <XTerminal
            wsUrl={session.wsUrl}
            sessionId={session.sessionId}
            onConnected={() => setConnected(true)}
            onDisconnected={() => setConnected(false)}
            onError={(err) => setError(err)}
          />
        </div>

        {/* Exercise sidebar */}
        <div className="flex w-80 shrink-0 flex-col border-l border-border/60 bg-card">
          {/* Exercise tabs */}
          <div className="flex gap-1 overflow-x-auto border-b border-border/60 px-2 py-1.5">
            {exercises.map((ex, i) => {
              const isCompleted =
                session.exercisesCompleted.includes(ex.id);
              return (
                <button
                  key={ex.id}
                  onClick={() => setActiveExercise(i)}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold transition-colors ${
                    i === activeExercise
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </button>
              );
            })}
          </div>

          {/* Active exercise detail */}
          {exercises[activeExercise] && (
            <div className="flex flex-1 flex-col overflow-y-auto p-4">
              <div className="flex-1 space-y-3">
                <h4 className="text-sm font-bold text-foreground">
                  {exercises[activeExercise].title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {exercises[activeExercise].description}
                </p>

                {/* Hints */}
                {exercises[activeExercise].hints.length > 0 && (
                  <div className="space-y-2">
                    {exercises[activeExercise].hints.map((hint, hIdx) => {
                      const revealed =
                        (hintsRevealed[exercises[activeExercise].id] ?? 0) >
                        hIdx;
                      if (!revealed) {
                        if (
                          hIdx ===
                          (hintsRevealed[exercises[activeExercise].id] ?? 0)
                        ) {
                          return (
                            <button
                              key={hIdx}
                              onClick={() =>
                                revealHint(exercises[activeExercise].id)
                              }
                              className="text-xs font-medium text-primary hover:underline"
                            >
                              Show hint {hIdx + 1}
                            </button>
                          );
                        }
                        return null;
                      }
                      return (
                        <div
                          key={hIdx}
                          className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300"
                        >
                          {hint}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Validate button */}
              {!session.exercisesCompleted.includes(
                exercises[activeExercise].id,
              ) ? (
                <button
                  onClick={() =>
                    validateExercise(exercises[activeExercise].id)
                  }
                  disabled={validating !== null}
                  className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  {validating === exercises[activeExercise].id
                    ? "Validating..."
                    : "Validate Exercise"}
                </button>
              ) : (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
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
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Completed
                </div>
              )}
            </div>
          )}

          {/* All completed banner */}
          {allCompleted && (
            <div className="border-t border-border/60 p-4">
              <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  All exercises completed!
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Time: {formatTime(elapsedSeconds)}
                </p>
                <button
                  onClick={stopSession}
                  className="mt-2 rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  End Lab Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="border-t border-border/60 bg-red-50 px-4 py-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
