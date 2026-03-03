/**
 * Lab Hint System (B-011).
 *
 * Progressive hint retrieval with usage tracking.
 * Each hint revealed reduces max XP for that exercise.
 */

import { getLabDefinition } from "./lab-content";

// ── Types ────────────────────────────────────────────────────────────────────

export interface HintResult {
  exerciseId: string;
  hintIndex: number;
  hint: string;
  totalHints: number;
  hintsRevealed: number;
  xpPenalty: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

/** XP penalty percentage per hint revealed */
const XP_PENALTY_PER_HINT = 15; // 15% per hint

/** Maximum total XP penalty from hints */
const MAX_XP_PENALTY = 50; // Cap at 50%

// ── In-memory hint tracking (per-session) ────────────────────────────────────

const sessionHints = new Map<string, Map<string, number>>();

/**
 * Get the number of hints revealed for an exercise in a session.
 */
export function getHintsRevealed(
  sessionId: string,
  exerciseId: string,
): number {
  return sessionHints.get(sessionId)?.get(exerciseId) ?? 0;
}

/**
 * Get total hints used across all exercises in a session.
 */
export function getTotalHintsUsed(sessionId: string): number {
  const exerciseHints = sessionHints.get(sessionId);
  if (!exerciseHints) return 0;

  let total = 0;
  for (const count of exerciseHints.values()) {
    total += count;
  }
  return total;
}

/**
 * Get the XP penalty for a specific exercise based on hints revealed.
 */
export function getExerciseXpPenalty(
  sessionId: string,
  exerciseId: string,
): number {
  const revealed = getHintsRevealed(sessionId, exerciseId);
  return Math.min(revealed * XP_PENALTY_PER_HINT, MAX_XP_PENALTY);
}

/**
 * Reveal the next hint for an exercise.
 * Returns the hint text and updated penalty info.
 */
export function revealHint(
  sessionId: string,
  labId: string,
  exerciseId: string,
): HintResult | { error: string } {
  const lab = getLabDefinition(labId);
  if (!lab) {
    return { error: `Lab "${labId}" not found` };
  }

  const exercise = lab.exercises.find((ex) => ex.id === exerciseId);
  if (!exercise) {
    return { error: `Exercise "${exerciseId}" not found` };
  }

  const totalHints = exercise.hints.length;
  if (totalHints === 0) {
    return { error: "No hints available for this exercise" };
  }

  // Get current hint count for this exercise
  if (!sessionHints.has(sessionId)) {
    sessionHints.set(sessionId, new Map());
  }

  const exerciseHints = sessionHints.get(sessionId)!;
  const currentRevealed = exerciseHints.get(exerciseId) ?? 0;

  if (currentRevealed >= totalHints) {
    return { error: "All hints already revealed" };
  }

  // Reveal next hint
  const hintIndex = currentRevealed;
  exerciseHints.set(exerciseId, currentRevealed + 1);

  return {
    exerciseId,
    hintIndex,
    hint: exercise.hints[hintIndex],
    totalHints,
    hintsRevealed: currentRevealed + 1,
    xpPenalty: Math.min(
      (currentRevealed + 1) * XP_PENALTY_PER_HINT,
      MAX_XP_PENALTY,
    ),
  };
}

/**
 * Get all revealed hints for an exercise.
 */
export function getRevealedHints(
  sessionId: string,
  labId: string,
  exerciseId: string,
): string[] {
  const lab = getLabDefinition(labId);
  if (!lab) return [];

  const exercise = lab.exercises.find((ex) => ex.id === exerciseId);
  if (!exercise) return [];

  const revealed = getHintsRevealed(sessionId, exerciseId);
  return exercise.hints.slice(0, revealed);
}

/**
 * Clean up hint tracking for a session.
 */
export function clearSessionHints(sessionId: string): void {
  sessionHints.delete(sessionId);
}
