import { describe, it, expect } from "vitest";
import { XP_REWARDS } from "../xp";
import { calculateLevel, xpToNextLevel, levelProgress, LEVELS } from "../levels";
import { scoreQuiz, getRandomQuestions, type Quiz } from "../quiz";

/**
 * Integration test: Full Learner Journey
 *
 * Simulates: sign-up → first lesson → quiz → XP tracking → leveling up →
 * module completion → path progress. Uses pure functions to verify the
 * core platform logic without requiring a database.
 */

// A sample quiz for testing the journey
const sampleQuiz: Quiz = {
  id: "quiz-linux-basics-01",
  title: "Linux Basics Quiz",
  description: "Test your Linux knowledge",
  lessonSlug: "01-the-linux-story",
  moduleSlug: "linux",
  pathSlug: "foundations",
  passingScore: 70,
  xpRewards: { pass: 50, perfect: 75, retry: 25 },
  questions: [
    {
      id: "q1",
      type: "multiple_choice",
      question: "What command lists files?",
      options: ["ls", "cd", "rm", "mv"],
      correctAnswer: 0,
      explanation: "ls lists directory contents.",
    },
    {
      id: "q2",
      type: "true_false",
      question: "Linux is open source.",
      correctAnswer: true,
      explanation: "Linux is released under the GPL.",
    },
    {
      id: "q3",
      type: "multiple_choice",
      question: "Which command changes directories?",
      options: ["mv", "cd", "cp", "ls"],
      correctAnswer: 1,
      explanation: "cd changes the current directory.",
    },
    {
      id: "q4",
      type: "code_completion",
      question: "Complete: ___ -la /home",
      options: ["ls", "cd", "rm", "cat"],
      correctAnswer: 0,
      explanation: "ls -la lists all files with details.",
    },
    {
      id: "q5",
      type: "multiple_choice",
      question: "What does chmod do?",
      options: ["Change file mode", "Change owner", "Copy files", "Move files"],
      correctAnswer: 0,
      explanation: "chmod changes file permissions.",
    },
  ],
};

describe("Integration: Full Learner Journey", () => {
  it("should simulate a complete learner journey from sign-up to level-up", () => {
    // ──────────────────────────────────────────────
    // Step 1: New user starts at 0 XP, Level 1
    // ──────────────────────────────────────────────
    let totalXP = 0;
    let level = calculateLevel(totalXP);
    expect(level.level).toBe(1);
    expect(level.title).toBe("Newcomer");
    expect(levelProgress(totalXP)).toBe(0);

    // ──────────────────────────────────────────────
    // Step 2: Complete first lesson (+100 XP)
    // ──────────────────────────────────────────────
    totalXP += XP_REWARDS.LESSON_COMPLETE;
    expect(totalXP).toBe(100);
    level = calculateLevel(totalXP);
    expect(level.level).toBe(1); // still level 1
    expect(level.title).toBe("Newcomer");

    // ──────────────────────────────────────────────
    // Step 3: Complete an exercise (+50 XP)
    // ──────────────────────────────────────────────
    totalXP += XP_REWARDS.EXERCISE_COMPLETE;
    expect(totalXP).toBe(150);

    // ──────────────────────────────────────────────
    // Step 4: Take quiz - answer all correctly (perfect)
    // ──────────────────────────────────────────────
    const quizAnswers: Record<string, number | boolean | string> = {
      q1: 0,
      q2: true,
      q3: 1,
      q4: 0,
      q5: 0,
    };

    const result = scoreQuiz(sampleQuiz, quizAnswers);
    expect(result.score).toBe(100);
    expect(result.correctAnswers).toBe(5);
    expect(result.passed).toBe(true);
    expect(result.totalQuestions).toBe(5);

    // Verify each result has explanation
    for (const r of result.results) {
      expect(r.explanation).toBeDefined();
      expect(r.explanation.length).toBeGreaterThan(0);
      expect(r.correct).toBe(true);
    }

    // Award perfect quiz XP
    totalXP += sampleQuiz.xpRewards.perfect;
    expect(totalXP).toBe(225);

    // ──────────────────────────────────────────────
    // Step 5: Daily streak (+25 XP)
    // ──────────────────────────────────────────────
    totalXP += XP_REWARDS.DAILY_STREAK;
    expect(totalXP).toBe(250);

    // ──────────────────────────────────────────────
    // Step 6: Complete more lessons to reach level 2
    // ──────────────────────────────────────────────
    // Need 500 XP for level 2, currently at 250
    totalXP += XP_REWARDS.LESSON_COMPLETE; // 350
    totalXP += XP_REWARDS.LESSON_COMPLETE; // 450
    totalXP += XP_REWARDS.EXERCISE_COMPLETE; // 500

    level = calculateLevel(totalXP);
    expect(level.level).toBe(2);
    expect(level.title).toBe("Apprentice");
    expect(totalXP).toBe(500);

    // ──────────────────────────────────────────────
    // Step 7: Complete a module (+200 XP)
    // ──────────────────────────────────────────────
    totalXP += XP_REWARDS.MODULE_COMPLETE;
    expect(totalXP).toBe(700);
    level = calculateLevel(totalXP);
    expect(level.level).toBe(2); // Still level 2

    // ──────────────────────────────────────────────
    // Step 8: Continue through path to level 3
    // ──────────────────────────────────────────────
    // Need 1500 XP for level 3, at 700
    for (let i = 0; i < 8; i++) {
      totalXP += XP_REWARDS.LESSON_COMPLETE; // +800
    }
    expect(totalXP).toBe(1500);

    level = calculateLevel(totalXP);
    expect(level.level).toBe(3);
    expect(level.title).toBe("Explorer");

    // ──────────────────────────────────────────────
    // Step 9: Complete an entire path (+500 XP)
    // ──────────────────────────────────────────────
    totalXP += XP_REWARDS.PATH_COMPLETE;
    expect(totalXP).toBe(2000);
    level = calculateLevel(totalXP);
    expect(level.level).toBe(3); // Still level 3

    // Check progress within level 3
    const progress = levelProgress(totalXP);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(100);

    // Check remaining XP to next level
    const remaining = xpToNextLevel(totalXP);
    expect(remaining).toBe(3500 - 2000);
  });

  it("should correctly handle quiz failure and retry flow", () => {
    // Answer only 2 of 5 correctly (40% < 70% passing)
    const failingAnswers: Record<string, number | boolean | string> = {
      q1: 0, // correct
      q2: false, // wrong
      q3: 3, // wrong
      q4: 0, // correct
      q5: 2, // wrong
    };

    const failResult = scoreQuiz(sampleQuiz, failingAnswers);
    expect(failResult.score).toBe(40);
    expect(failResult.correctAnswers).toBe(2);
    expect(failResult.passed).toBe(false);

    // Verify wrong answers show explanations too
    const wrongQ2 = failResult.results.find((r) => r.questionId === "q2");
    expect(wrongQ2?.correct).toBe(false);
    expect(wrongQ2?.explanation).toBeDefined();
    expect(wrongQ2?.correctAnswer).toBe(true);

    // Retry with correct answers
    const retryAnswers: Record<string, number | boolean | string> = {
      q1: 0, q2: true, q3: 1, q4: 0, q5: 0,
    };

    const retryResult = scoreQuiz(sampleQuiz, retryAnswers);
    expect(retryResult.passed).toBe(true);
    expect(retryResult.score).toBe(100);

    // Retry gives less XP
    const retryXP = sampleQuiz.xpRewards.retry;
    expect(retryXP).toBe(25);
    expect(retryXP).toBeLessThan(sampleQuiz.xpRewards.perfect);
  });

  it("should handle quiz randomization while preserving scoring", () => {
    const randomized = getRandomQuestions(sampleQuiz, 3);
    expect(randomized).toHaveLength(3);

    // All returned questions should be from the original quiz
    for (const q of randomized) {
      const original = sampleQuiz.questions.find((oq) => oq.id === q.id);
      expect(original).toBeDefined();
      expect(q.correctAnswer).toBe(original!.correctAnswer);
    }

    // Create a mini quiz with the randomized questions and score it
    const miniQuiz: Quiz = {
      ...sampleQuiz,
      questions: randomized,
    };

    const answers: Record<string, number | boolean | string> = {};
    for (const q of randomized) {
      answers[q.id] = q.correctAnswer;
    }

    const result = scoreQuiz(miniQuiz, answers);
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });

  it("should correctly track level progression from 1 to 10", () => {
    // Verify all level boundaries
    expect(calculateLevel(0).level).toBe(1);
    expect(calculateLevel(499).level).toBe(1);
    expect(calculateLevel(500).level).toBe(2);
    expect(calculateLevel(1499).level).toBe(2);
    expect(calculateLevel(1500).level).toBe(3);
    expect(calculateLevel(3500).level).toBe(4);
    expect(calculateLevel(6500).level).toBe(5);
    expect(calculateLevel(11000).level).toBe(6);
    expect(calculateLevel(17500).level).toBe(7);
    expect(calculateLevel(27500).level).toBe(8);
    expect(calculateLevel(42500).level).toBe(9);
    expect(calculateLevel(65000).level).toBe(10);
    expect(calculateLevel(100000).level).toBe(10);

    // Max level has 0 remaining XP
    expect(xpToNextLevel(65000)).toBe(0);
  });

  it("should correctly calculate XP for a complete path journey", () => {
    // Simulate completing an entire path:
    // 8 lessons × 100 XP = 800
    // 8 exercises × 50 XP = 400
    // 8 quizzes passed × 50 XP = 400
    // 2 modules × 200 XP = 400
    // 1 path complete × 500 XP = 500
    // 30 daily streaks × 25 XP = 750
    // Total: 3,250 XP

    const pathXP =
      8 * XP_REWARDS.LESSON_COMPLETE +
      8 * XP_REWARDS.EXERCISE_COMPLETE +
      8 * XP_REWARDS.QUIZ_PASS +
      2 * XP_REWARDS.MODULE_COMPLETE +
      XP_REWARDS.PATH_COMPLETE +
      30 * XP_REWARDS.DAILY_STREAK;

    expect(pathXP).toBe(3250);

    const level = calculateLevel(pathXP);
    expect(level.level).toBe(3); // Explorer level
    expect(level.title).toBe("Explorer");
  });
});
