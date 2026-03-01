"use client";

import Link from "next/link";

interface QuizResult {
  questionId: string;
  correct: boolean;
  selectedAnswer: number | boolean | string;
  correctAnswer: number | boolean | string;
  explanation: string;
  referenceLesson?: string;
}

interface QuizResultsProps {
  title: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  xpEarned: number;
  leveledUp: boolean;
  results: QuizResult[];
  questions: Array<{
    id: string;
    question: string;
    options?: string[];
    type: string;
  }>;
  onRetake: () => void;
  lessonUrl?: string;
}

export function QuizResults({
  title,
  score,
  totalQuestions,
  correctAnswers,
  passed,
  xpEarned,
  leveledUp,
  results,
  questions,
  onRetake,
  lessonUrl,
}: QuizResultsProps) {
  return (
    <div>
      {/* Score Summary */}
      <div
        className={`mb-8 rounded-lg border p-6 text-center ${
          passed
            ? "border-green-500/20 bg-green-500/10"
            : "border-red-500/20 bg-red-500/10"
        }`}
      >
        <div className="text-5xl font-bold">{score}%</div>
        <div className="mt-2 text-lg">
          {passed ? "Passed!" : "Not quite there yet"}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          {correctAnswers} of {totalQuestions} correct
        </div>
        {xpEarned > 0 && (
          <div className="mt-2 font-medium text-primary">
            +{xpEarned} XP earned
            {leveledUp && " — Level Up!"}
          </div>
        )}
      </div>

      {/* Per-question breakdown */}
      <h3 className="mb-4 text-lg font-semibold">Question Review</h3>
      <div className="space-y-4">
        {results.map((result, i) => {
          const question = questions.find((q) => q.id === result.questionId);
          return (
            <div
              key={result.questionId}
              className={`rounded-lg border p-4 ${
                result.correct
                  ? "border-green-500/20 bg-green-500/5"
                  : "border-red-500/20 bg-red-500/5"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className={result.correct ? "text-green-600" : "text-red-600"}>
                  {result.correct ? "✓" : "✗"}
                </span>
                <span className="font-medium">Question {i + 1}</span>
              </div>
              {question && (
                <p className="mb-2 text-sm">{question.question}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {result.explanation}
              </p>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={onRetake}
          className="rounded-lg border px-6 py-2 transition-colors hover:bg-muted"
        >
          Retake Quiz
        </button>
        {lessonUrl && (
          <Link
            href={lessonUrl}
            className="rounded-lg bg-primary px-6 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Return to Lesson
          </Link>
        )}
      </div>
    </div>
  );
}
