/**
 * XP constants for the DEVOPS ENGINEERS platform.
 * PRD Reference: Section 10.2
 */

export const XP_REWARDS = {
  LESSON_COMPLETE: 100,
  EXERCISE_COMPLETE: 50,
  QUIZ_PASS: 50,
  QUIZ_PERFECT: 75,
  MINI_PROJECT: 150,
  MODULE_COMPLETE: 200,
  PATH_COMPLETE: 500,
  DAILY_STREAK: 25,
  CAPSTONE_PROJECT: 1000,
} as const;

export type XPSource = keyof typeof XP_REWARDS;
