import fs from "fs";
import path from "path";
import { glob } from "glob";

const QUIZ_DIR = path.join(process.cwd(), "..", "..", "content", "quizzes");

export interface QuizQuestion {
  id: string;
  type: "multiple_choice" | "true_false" | "code_completion";
  question: string;
  options?: string[];
  correctAnswer: number | boolean | string;
  explanation: string;
  referenceLesson?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  lessonSlug: string;
  moduleSlug: string;
  pathSlug: string;
  passingScore: number;
  timeLimit?: number;
  isAssessment?: boolean;
  xpRewards: {
    pass: number;
    perfect: number;
    retry: number;
  };
  questions: QuizQuestion[];
}

/**
 * Load a quiz by its ID.
 */
export function getQuizById(quizId: string): Quiz | null {
  const quizFiles = glob.sync("**/*.json", { cwd: QUIZ_DIR });

  for (const file of quizFiles) {
    if (file === "schema.json") continue;
    const filePath = path.join(QUIZ_DIR, file);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const quiz = JSON.parse(content) as Quiz;
      if (quiz.id === quizId) return quiz;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Load a quiz by lesson slug.
 */
export function getQuizByLesson(
  pathSlug: string,
  moduleSlug: string,
  lessonSlug: string,
): Quiz | null {
  const quizDir = path.join(QUIZ_DIR, pathSlug, moduleSlug);
  if (!fs.existsSync(quizDir)) return null;

  const files = fs.readdirSync(quizDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const filePath = path.join(quizDir, file);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const quiz = JSON.parse(content) as Quiz;
      if (quiz.lessonSlug === lessonSlug) return quiz;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Load an assessment quiz by module slug.
 */
export function getAssessment(
  pathSlug: string,
  moduleSlug: string,
): Quiz | null {
  const assessmentsDir = path.join(QUIZ_DIR, "assessments");
  if (!fs.existsSync(assessmentsDir)) return null;

  const files = fs.readdirSync(assessmentsDir).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    const filePath = path.join(assessmentsDir, file);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const quiz = JSON.parse(content) as Quiz;
      if (quiz.pathSlug === pathSlug && quiz.moduleSlug === moduleSlug) return quiz;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Get a randomized subset of questions for a quiz attempt.
 */
export function getRandomQuestions(
  quiz: Quiz,
  count?: number,
): QuizQuestion[] {
  const questions = [...quiz.questions];
  const total = count ?? questions.length;

  // Fisher-Yates shuffle
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  return questions.slice(0, total);
}

/**
 * Score a quiz submission.
 */
export function scoreQuiz(
  quiz: Quiz,
  answers: Record<string, number | boolean | string>,
): {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  results: Array<{
    questionId: string;
    correct: boolean;
    selectedAnswer: number | boolean | string;
    correctAnswer: number | boolean | string;
    explanation: string;
    referenceLesson?: string;
  }>;
} {
  let correct = 0;
  const results = quiz.questions.map((q) => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.correctAnswer;
    if (isCorrect) correct++;

    return {
      questionId: q.id,
      correct: isCorrect,
      selectedAnswer: userAnswer,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      referenceLesson: q.referenceLesson,
    };
  });

  const score = Math.round((correct / quiz.questions.length) * 100);
  const passed = score >= quiz.passingScore;

  return {
    score,
    totalQuestions: quiz.questions.length,
    correctAnswers: correct,
    passed,
    results,
  };
}
