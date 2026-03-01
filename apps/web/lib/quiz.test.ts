import { describe, it, expect } from "vitest";
import { scoreQuiz, getRandomQuestions } from "./quiz";
import type { Quiz, QuizQuestion } from "./quiz";

const sampleQuestions: QuizQuestion[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question: "What is Linux?",
    options: ["A browser", "An OS kernel", "A database", "A language"],
    correctAnswer: 1,
    explanation: "Linux is an operating system kernel.",
  },
  {
    id: "q2",
    type: "true_false",
    question: "Linux powers over 96% of top servers.",
    correctAnswer: true,
    explanation: "Linux dominates server infrastructure.",
  },
  {
    id: "q3",
    type: "multiple_choice",
    question: "Which distro is recommended for beginners?",
    options: ["Arch", "Gentoo", "Ubuntu", "Alpine"],
    correctAnswer: 2,
    explanation: "Ubuntu has the largest community.",
  },
  {
    id: "q4",
    type: "multiple_choice",
    question: "What does pwd do?",
    options: ["Print password", "Print working directory", "Power down", "Previous directory"],
    correctAnswer: 1,
    explanation: "pwd prints the current working directory.",
  },
  {
    id: "q5",
    type: "matching",
    question: "Match tools to their purpose",
    matchingPairs: [
      { left: "grep", right: "Search file contents" },
      { left: "find", right: "Search file names" },
      { left: "cat", right: "Display file contents" },
    ],
    correctAnswer: JSON.stringify([0, 1, 2]),
    explanation: "Each tool has a specific purpose.",
  },
];

const sampleQuiz: Quiz = {
  id: "test-quiz",
  title: "Test Quiz",
  lessonSlug: "test-lesson",
  moduleSlug: "test-module",
  pathSlug: "test-path",
  passingScore: 70,
  xpRewards: { pass: 50, perfect: 75, retry: 25 },
  questions: sampleQuestions,
};

describe("scoreQuiz", () => {
  it("scores a perfect quiz correctly", () => {
    const answers = {
      q1: 1,
      q2: true,
      q3: 2,
      q4: 1,
      q5: JSON.stringify([0, 1, 2]),
    };

    const result = scoreQuiz(sampleQuiz, answers);
    expect(result.score).toBe(100);
    expect(result.correctAnswers).toBe(5);
    expect(result.totalQuestions).toBe(5);
    expect(result.passed).toBe(true);
    expect(result.results.every((r) => r.correct)).toBe(true);
  });

  it("scores a failing quiz correctly", () => {
    const answers = {
      q1: 0, // wrong
      q2: false, // wrong
      q3: 0, // wrong
      q4: 0, // wrong
      q5: JSON.stringify([2, 1, 0]), // wrong
    };

    const result = scoreQuiz(sampleQuiz, answers);
    expect(result.score).toBe(0);
    expect(result.correctAnswers).toBe(0);
    expect(result.passed).toBe(false);
  });

  it("scores a partial quiz correctly", () => {
    const answers = {
      q1: 1, // correct
      q2: true, // correct
      q3: 0, // wrong
      q4: 0, // wrong
      q5: JSON.stringify([2, 1, 0]), // wrong
    };

    const result = scoreQuiz(sampleQuiz, answers);
    expect(result.score).toBe(40);
    expect(result.correctAnswers).toBe(2);
    expect(result.passed).toBe(false);
  });

  it("passes at exactly the passing score", () => {
    // 4 out of 5 = 80%, above 70% threshold
    const answers = {
      q1: 1, // correct
      q2: true, // correct
      q3: 2, // correct
      q4: 1, // correct
      q5: JSON.stringify([2, 1, 0]), // wrong
    };

    const result = scoreQuiz(sampleQuiz, answers);
    expect(result.score).toBe(80);
    expect(result.passed).toBe(true);
  });

  it("includes explanations and correct answers in results", () => {
    const answers = { q1: 0, q2: false, q3: 0, q4: 0, q5: "" };
    const result = scoreQuiz(sampleQuiz, answers);

    const q1Result = result.results.find((r) => r.questionId === "q1");
    expect(q1Result).toBeDefined();
    expect(q1Result!.correct).toBe(false);
    expect(q1Result!.correctAnswer).toBe(1);
    expect(q1Result!.selectedAnswer).toBe(0);
    expect(q1Result!.explanation).toBe("Linux is an operating system kernel.");
  });

  it("handles matching questions with JSON serialized answers", () => {
    const answers = {
      q1: 1,
      q2: true,
      q3: 2,
      q4: 1,
      q5: JSON.stringify([0, 1, 2]),
    };

    const result = scoreQuiz(sampleQuiz, answers);
    const q5Result = result.results.find((r) => r.questionId === "q5");
    expect(q5Result!.correct).toBe(true);
  });
});

describe("getRandomQuestions", () => {
  it("returns all questions when no count specified", () => {
    const questions = getRandomQuestions(sampleQuiz);
    expect(questions.length).toBe(5);
  });

  it("returns the requested number of questions", () => {
    const questions = getRandomQuestions(sampleQuiz, 3);
    expect(questions.length).toBe(3);
  });

  it("returns 1 question when count is 1", () => {
    const questions = getRandomQuestions(sampleQuiz, 1);
    expect(questions.length).toBe(1);
  });

  it("all returned questions are valid quiz questions", () => {
    const questions = getRandomQuestions(sampleQuiz, 3);
    const ids = sampleQuestions.map((q) => q.id);
    for (const q of questions) {
      expect(ids).toContain(q.id);
    }
  });

  it("returns unique questions (no duplicates)", () => {
    const questions = getRandomQuestions(sampleQuiz, 5);
    const ids = questions.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
