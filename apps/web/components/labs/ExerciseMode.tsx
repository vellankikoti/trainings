"use client";

import { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export type LabMode = "guided" | "challenge" | "playground";

interface Exercise {
  id: string;
  title: string;
  description: string;
  hints: string[];
}

interface ExerciseModeProps {
  mode: LabMode;
  exercises: Exercise[];
  completedExercises: string[];
  activeExercise: number;
  onExerciseSelect: (index: number) => void;
  onValidate: (exerciseId: string) => void;
  validating: string | null;
}

// ── Mode selector ────────────────────────────────────────────────────────────

interface ModeSelectorProps {
  mode: LabMode;
  onModeChange: (mode: LabMode) => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  const modes: { value: LabMode; label: string; description: string }[] = [
    {
      value: "guided",
      label: "Guided",
      description: "Step-by-step instructions with hints",
    },
    {
      value: "challenge",
      label: "Challenge",
      description: "Goals only — figure it out yourself",
    },
    {
      value: "playground",
      label: "Playground",
      description: "Free exploration — no exercises",
    },
  ];

  return (
    <div className="flex gap-1 rounded-lg border border-border/60 bg-muted/30 p-1">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => onModeChange(m.value)}
          title={m.description}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === m.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

// ── Guided mode ──────────────────────────────────────────────────────────────

function GuidedExercise({
  exercise,
  index,
  isCompleted,
  isActive,
  onSelect,
  onValidate,
  validating,
}: {
  exercise: Exercise;
  index: number;
  isCompleted: boolean;
  isActive: boolean;
  onSelect: () => void;
  onValidate: () => void;
  validating: boolean;
}) {
  const [hintsShown, setHintsShown] = useState(0);

  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${
        isActive
          ? "border-primary/40 bg-primary/5"
          : isCompleted
            ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10"
            : "border-border/40 bg-card"
      }`}
    >
      <button
        onClick={onSelect}
        className="flex w-full items-start gap-3 text-left"
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            isCompleted
              ? "bg-emerald-500 text-white"
              : isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
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
            index + 1
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium ${
              isCompleted
                ? "text-muted-foreground line-through"
                : "text-foreground"
            }`}
          >
            {exercise.title}
          </p>
          {isActive && (
            <p className="mt-1 text-xs text-muted-foreground">
              {exercise.description}
            </p>
          )}
        </div>
      </button>

      {isActive && !isCompleted && (
        <div className="mt-3 space-y-2 pl-9">
          {/* Progressive hints */}
          {exercise.hints.slice(0, hintsShown).map((hint, i) => (
            <div
              key={i}
              className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300"
            >
              <span className="font-semibold">Hint {i + 1}:</span> {hint}
            </div>
          ))}

          <div className="flex items-center gap-2">
            {hintsShown < exercise.hints.length && (
              <button
                onClick={() => setHintsShown((s) => s + 1)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Show hint (-15% XP)
              </button>
            )}
          </div>

          <button
            onClick={onValidate}
            disabled={validating}
            className="mt-1 w-full rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {validating ? "Checking..." : "Check My Work"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Challenge mode ───────────────────────────────────────────────────────────

function ChallengeExercise({
  exercise,
  index,
  isCompleted,
  onValidate,
  validating,
}: {
  exercise: Exercise;
  index: number;
  isCompleted: boolean;
  onValidate: () => void;
  validating: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 ${
        isCompleted
          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10"
          : "border-border/40"
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isCompleted
            ? "bg-emerald-500 text-white"
            : "bg-muted text-muted-foreground"
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
          index + 1
        )}
      </span>
      <p
        className={`flex-1 text-sm ${
          isCompleted
            ? "text-muted-foreground line-through"
            : "font-medium text-foreground"
        }`}
      >
        {exercise.title}
      </p>
      {!isCompleted && (
        <button
          onClick={onValidate}
          disabled={validating}
          className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          {validating ? "..." : "Check"}
        </button>
      )}
    </div>
  );
}

// ── Playground mode ──────────────────────────────────────────────────────────

function PlaygroundView() {
  return (
    <div className="space-y-3 p-4">
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <h3 className="text-sm font-bold text-foreground">Playground Mode</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Free exploration — experiment with commands, break things, learn by
          doing. No validation, no scoring.
        </p>
      </div>
      <div className="space-y-2 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Try these:</p>
        <ul className="space-y-1 pl-4">
          <li className="list-disc">Explore the filesystem</li>
          <li className="list-disc">Create files and directories</li>
          <li className="list-disc">Practice piping commands</li>
          <li className="list-disc">Write a shell script</li>
        </ul>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function ExercisePanel({
  mode,
  exercises,
  completedExercises,
  activeExercise,
  onExerciseSelect,
  onValidate,
  validating,
}: ExerciseModeProps) {
  if (mode === "playground") {
    return <PlaygroundView />;
  }

  if (mode === "challenge") {
    return (
      <div className="space-y-2 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Objectives
        </h3>
        {exercises.map((ex, i) => (
          <ChallengeExercise
            key={ex.id}
            exercise={ex}
            index={i}
            isCompleted={completedExercises.includes(ex.id)}
            onValidate={() => onValidate(ex.id)}
            validating={validating === ex.id}
          />
        ))}
      </div>
    );
  }

  // Guided mode (default)
  return (
    <div className="space-y-2 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Exercises
      </h3>
      {exercises.map((ex, i) => (
        <GuidedExercise
          key={ex.id}
          exercise={ex}
          index={i}
          isCompleted={completedExercises.includes(ex.id)}
          isActive={i === activeExercise}
          onSelect={() => onExerciseSelect(i)}
          onValidate={() => onValidate(ex.id)}
          validating={validating === ex.id}
        />
      ))}
    </div>
  );
}
