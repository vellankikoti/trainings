/**
 * Level system for the DEVOPS ENGINEERS platform.
 * PRD Reference: Section 10.2 — 10 levels, Newcomer to Distinguished Engineer.
 */

export interface Level {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
}

export const LEVELS: Level[] = [
  { level: 1, title: "Newcomer", minXP: 0, maxXP: 499 },
  { level: 2, title: "Apprentice", minXP: 500, maxXP: 1499 },
  { level: 3, title: "Explorer", minXP: 1500, maxXP: 3499 },
  { level: 4, title: "Practitioner", minXP: 3500, maxXP: 6499 },
  { level: 5, title: "Engineer", minXP: 6500, maxXP: 10999 },
  { level: 6, title: "Senior Engineer", minXP: 11000, maxXP: 17499 },
  { level: 7, title: "Staff Engineer", minXP: 17500, maxXP: 27499 },
  { level: 8, title: "Principal Engineer", minXP: 27500, maxXP: 42499 },
  { level: 9, title: "Architect", minXP: 42500, maxXP: 64999 },
  { level: 10, title: "Distinguished Engineer", minXP: 65000, maxXP: Infinity },
];

/**
 * Returns the level object for a given total XP.
 */
export function calculateLevel(totalXP: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].minXP) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

/**
 * Returns XP remaining to reach the next level.
 * Returns 0 if already at max level.
 */
export function xpToNextLevel(totalXP: number): number {
  const current = calculateLevel(totalXP);
  if (current.level >= LEVELS.length) return 0;
  return current.maxXP + 1 - totalXP;
}

/**
 * Returns progress percentage within the current level (0–100).
 */
export function levelProgress(totalXP: number): number {
  const current = calculateLevel(totalXP);
  if (current.level >= LEVELS.length) return 100;
  const range = current.maxXP - current.minXP + 1;
  const progress = totalXP - current.minXP;
  return Math.round((progress / range) * 100);
}
