"use client";

import { useState } from "react";
import { ModeSelector, ExercisePanel, type LabMode } from "./ExerciseMode";

// ── Types ────────────────────────────────────────────────────────────────────

interface Exercise {
  id: string;
  title: string;
  description: string;
  hints: string[];
}

interface InstructionsPanelProps {
  labTitle: string;
  labDescription: string;
  difficulty: string;
  duration: number;
  exercises: Exercise[];
  completedExercises: string[];
  activeExercise: number;
  onExerciseSelect: (index: number) => void;
  onValidate: (exerciseId: string) => void;
  validating: string | null;
  elapsedSeconds: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ── Component ────────────────────────────────────────────────────────────────

export function InstructionsPanel({
  labTitle,
  labDescription,
  difficulty,
  duration,
  exercises,
  completedExercises,
  activeExercise,
  onExerciseSelect,
  onValidate,
  validating,
  elapsedSeconds,
}: InstructionsPanelProps) {
  const [mode, setMode] = useState<LabMode>("guided");

  const completedCount = completedExercises.length;
  const totalCount = exercises.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="shrink-0 border-b border-border/60 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">{labTitle}</h2>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
              DIFFICULTY_COLORS[difficulty] ??
              "bg-muted text-muted-foreground"
            }`}
          >
            {difficulty}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{labDescription}</p>

        {/* Stats bar */}
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-mono tabular-nums">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
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
            {formatTime(elapsedSeconds)} / {duration}m
          </span>
          <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {completedCount}/{totalCount} done
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Mode selector */}
        <div className="mt-3">
          <ModeSelector mode={mode} onModeChange={setMode} />
        </div>
      </div>

      {/* Exercise panel (mode-dependent) */}
      <div className="flex-1 overflow-y-auto">
        <ExercisePanel
          mode={mode}
          exercises={exercises}
          completedExercises={completedExercises}
          activeExercise={activeExercise}
          onExerciseSelect={onExerciseSelect}
          onValidate={onValidate}
          validating={validating}
        />
      </div>

      {/* All completed */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className="shrink-0 border-t border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-900/20">
          <div className="text-center">
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
              All exercises completed!
            </p>
            <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/70">
              Time: {formatTime(elapsedSeconds)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
