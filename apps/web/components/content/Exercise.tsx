"use client";

import { useState } from "react";

interface ExerciseProps {
  number?: number;
  title: string;
  difficulty?: string;
  xpReward?: number;
  estimatedMinutes?: number;
  objectives?: string[];
  hints?: string[];
  validationCriteria?: string[];
  children: React.ReactNode;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  advanced: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

export function Exercise({ number, title, difficulty, xpReward, estimatedMinutes, children }: ExerciseProps) {
  const [completed, setCompleted] = useState(false);

  return (
    <div className={`not-prose my-8 overflow-hidden rounded-xl border-l-4 ${completed ? "border-l-emerald-500" : "border-l-primary"} border border-border/60 bg-card shadow-sm transition-all`}>
      <div className="flex items-start gap-4 p-5 pb-4">
        <button
          onClick={() => setCompleted(!completed)}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
            completed
              ? "border-emerald-500 bg-emerald-500 text-white scale-110"
              : "border-muted-foreground/30 hover:border-primary"
          }`}
          aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {completed && (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`text-lg font-bold ${completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
              {number ? `Exercise ${number}: ` : ""}
              {title}
            </h3>
          </div>

          {(difficulty || xpReward || estimatedMinutes) && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {difficulty && (
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.beginner}`}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
              )}
              {xpReward && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
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

      <div className="px-5 pb-5 pl-[3.75rem] text-[0.938rem] leading-relaxed [&>p]:mb-3 [&>p:last-child]:mb-0 [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>pre]:my-3 [&>pre]:rounded-lg">
        {children}
      </div>
    </div>
  );
}
