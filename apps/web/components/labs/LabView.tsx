"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SplitPane } from "./SplitPane";
import { InstructionsPanel } from "./InstructionsPanel";
import { XTerminal } from "./XTerminal";

// ── LocalStorage helpers for session resume ────────────────────────────────

const STORAGE_KEY = "lab_session_state";

interface StoredLabState {
  sessionId: string;
  labId: string;
  activeExercise: number;
  elapsedSeconds: number;
  savedAt: number;
}

function saveLabState(state: StoredLabState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota exceeded or private browsing */ }
}

function loadLabState(labId: string): StoredLabState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredLabState;
    if (parsed.labId !== labId) return null;
    // Expire after 2 hours
    if (Date.now() - parsed.savedAt > 2 * 60 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

function clearLabState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

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

export interface LabViewProps {
  labId: string;
  labTitle: string;
  labDescription: string;
  difficulty: string;
  duration: number;
  exercises: Exercise[];
  lessonLink: string | null;
}

// ── Component ────────────────────────────────────────────────────────────────

export function LabView({
  labId,
  labTitle,
  labDescription,
  difficulty,
  duration,
  exercises,
  lessonLink,
}: LabViewProps) {
  const router = useRouter();
  const [session, setSession] = useState<LabSessionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [activeExercise, setActiveExercise] = useState(0);
  const [validating, setValidating] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const elapsedRef = useRef(0);

  // ── Timer ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!session || session.status !== "running") return;

    const interval = setInterval(() => {
      setElapsedSeconds((s) => {
        const next = s + 1;
        elapsedRef.current = next;
        return next;
      });
    }, 1000);

    // Save state every 10 seconds
    const saveInterval = setInterval(() => {
      saveLabState({
        sessionId: session.sessionId,
        labId,
        activeExercise,
        elapsedSeconds: elapsedRef.current,
        savedAt: Date.now(),
      });
    }, 10_000);

    return () => {
      clearInterval(interval);
      clearInterval(saveInterval);
    };
  }, [session, labId, activeExercise]);

  // ── Auto-start or resume session ──────────────────────────────────────────

  useEffect(() => {
    async function initSession() {
      const savedState = loadLabState(labId);

      try {
        // Check for existing session on the backend
        const checkRes = await fetch("/api/labs/session");
        const checkData = await checkRes.json();

        if (checkData.sessionId && checkData.labType === labId) {
          setSession({
            sessionId: checkData.sessionId,
            status: checkData.status,
            wsUrl: checkData.wsUrl ?? null,
            labType: checkData.labType,
            exercisesCompleted: checkData.exercisesCompleted ?? [],
          });

          // Restore frontend state from localStorage if session matches
          if (savedState && savedState.sessionId === checkData.sessionId) {
            setActiveExercise(savedState.activeExercise);
            setElapsedSeconds(savedState.elapsedSeconds);
            elapsedRef.current = savedState.elapsedSeconds;
          }

          setLoading(false);
          return;
        }

        // Start new session
        const res = await fetch("/api/labs/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ labType: labId }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to start lab session");
          setLoading(false);
          return;
        }

        setSession({
          sessionId: data.sessionId,
          status: data.status,
          wsUrl: data.wsUrl ?? null,
          labType: data.labType,
          exercisesCompleted: [],
        });
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, [labId]);

  // ── Stop session ───────────────────────────────────────────────────────────

  const stopSession = useCallback(async () => {
    if (!session) return;

    clearLabState();

    try {
      await fetch(`/api/labs/${session.sessionId}`, { method: "DELETE" });
    } catch {
      // Best effort
    }

    if (lessonLink) {
      router.push(lessonLink);
    } else {
      router.push("/dashboard");
    }
  }, [session, lessonLink, router]);

  // ── Validate exercise ──────────────────────────────────────────────────────

  const validateExercise = useCallback(
    async (exerciseId: string) => {
      if (!session) return;
      setValidating(exerciseId);
      setError(null);

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
          const nextIdx = exercises.findIndex(
            (ex, i) =>
              i > activeExercise &&
              ex.id !== exerciseId &&
              !session.exercisesCompleted.includes(ex.id),
          );

          if (nextIdx !== -1) {
            setActiveExercise(nextIdx);
          }
        } else {
          setError(data.message || "Validation failed. Keep trying!");
        }
      } catch {
        setError("Failed to validate exercise.");
      } finally {
        setValidating(null);
      }
    },
    [session, exercises, activeExercise],
  );

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-card">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">
            Starting lab environment...
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────

  if (!session) {
    const isSessionExpired = error?.toLowerCase().includes("expired");
    const isRateLimited = error?.toLowerCase().includes("rate");
    const isUnavailable = error?.toLowerCase().includes("unavailable") || error?.toLowerCase().includes("container");

    return (
      <div className="flex h-full items-center justify-center bg-card">
        <div className="max-w-sm text-center">
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${
            isSessionExpired ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
            : isRateLimited ? "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
            : "bg-destructive/10 text-destructive"
          }`}>
            {isSessionExpired ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            ) : isUnavailable ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
            )}
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">
            {isSessionExpired ? "Session Expired" : isRateLimited ? "Too Many Requests" : isUnavailable ? "Lab Unavailable" : "Connection Failed"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || "Failed to start lab session. Please try again."}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {isSessionExpired ? "Start New Session" : "Try Again"}
            </button>
            {lessonLink && (
              <button
                onClick={() => router.push(lessonLink)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Back to Lesson
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const completedCount = session.exercisesCompleted.length;
  const totalCount = exercises.length;
  const isLabComplete = completedCount === totalCount && totalCount > 0;

  // ── Format time ──────────────────────────────────────────────────────────
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Completion summary ──────────────────────────────────────────────────

  if (isLabComplete) {
    clearLabState();
    return (
      <div className="flex h-full items-center justify-center bg-[#0f1419]">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h2 className="mt-5 text-2xl font-bold text-white">Lab Complete!</h2>
          <p className="mt-2 text-sm text-[hsl(215,16%,60%)]">
            You&apos;ve completed all exercises in {labTitle}.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xl font-bold tabular-nums text-emerald-400">
                {totalCount}
              </div>
              <div className="mt-0.5 text-xs text-[hsl(215,16%,50%)]">
                Exercises
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xl font-bold tabular-nums text-blue-400">
                {formatTime(elapsedSeconds)}
              </div>
              <div className="mt-0.5 text-xs text-[hsl(215,16%,50%)]">
                Time Taken
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xl font-bold tabular-nums text-amber-400">
                {difficulty}
              </div>
              <div className="mt-0.5 text-xs text-[hsl(215,16%,50%)]">
                Difficulty
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            {lessonLink && (
              <button
                onClick={() => router.push(lessonLink)}
                className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Back to Lesson
              </button>
            )}
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main layout ────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/60 bg-[#0f1419] px-4 py-1.5">
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

        <div className="flex items-center gap-4">
          {error && (
            <span className="text-xs text-red-400">{error}</span>
          )}
          <span className="font-mono text-xs tabular-nums text-emerald-400">
            {completedCount}/{totalCount}
          </span>
          <button
            onClick={stopSession}
            className="rounded px-3 py-1 text-xs font-medium text-[hsl(215,16%,60%)] transition-colors hover:bg-white/5 hover:text-white"
          >
            End Lab
          </button>
        </div>
      </div>

      {/* Split pane: instructions + terminal */}
      <div className="flex-1 overflow-hidden">
        <SplitPane
          left={
            <InstructionsPanel
              labTitle={labTitle}
              labDescription={labDescription}
              difficulty={difficulty}
              duration={duration}
              exercises={exercises}
              completedExercises={session.exercisesCompleted}
              activeExercise={activeExercise}
              onExerciseSelect={setActiveExercise}
              onValidate={validateExercise}
              validating={validating}
              elapsedSeconds={elapsedSeconds}
            />
          }
          right={
            <XTerminal
              wsUrl={session.wsUrl}
              sessionId={session.sessionId}
              onConnected={() => setConnected(true)}
              onDisconnected={() => setConnected(false)}
              onError={(err) => setError(err)}
            />
          }
          defaultLeftPercent={38}
          minLeftPx={300}
          minRightPx={400}
        />
      </div>
    </div>
  );
}
