"use client";

import { useState, useEffect, useCallback } from "react";
import { QuestionCard } from "./QuestionCard";
import { QuizResults } from "./QuizResults";

interface QuizQuestion {
  id: string;
  type: string;
  question: string;
  options?: string[];
  difficulty?: string;
}

interface QuizData {
  quizId: string;
  title: string;
  description?: string;
  passingScore: number;
  timeLimit?: number;
  totalQuestions: number;
  questions: QuizQuestion[];
}

interface SubmitResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  xpEarned: number;
  leveledUp: boolean;
  results: Array<{
    questionId: string;
    correct: boolean;
    selectedAnswer: number | boolean | string;
    correctAnswer: number | boolean | string;
    explanation: string;
    referenceLesson?: string;
  }>;
}

interface QuizContainerProps {
  quizId: string;
  lessonUrl?: string;
}

export function QuizContainer({ quizId, lessonUrl }: QuizContainerProps) {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | boolean | string>>({});
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId }),
      });
      if (!res.ok) throw new Error("Failed to load quiz");
      const data = await res.json();
      setQuizData(data);
      if (data.timeLimit) setTimeRemaining(data.timeLimit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const handleAnswer = (answer: number | boolean | string) => {
    if (!quizData) return;
    const questionId = quizData.questions[currentIndex].id;
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = useCallback(async () => {
    if (!quizData || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId,
          answers,
          timeSpentSeconds: Math.floor((Date.now() - startTime) / 1000),
        }),
      });
      if (!res.ok) throw new Error("Failed to submit quiz");
      const result = await res.json();
      setSubmitResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  }, [quizData, submitting, quizId, answers, startTime]);

  // Timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || submitResult) return;
    const timer = setInterval(() => {
      setTimeRemaining((t) => {
        if (t === null || t <= 1) {
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining, submitResult, handleSubmit]);

  const handleRetake = () => {
    setAnswers({});
    setCurrentIndex(0);
    setSubmitResult(null);
    setTimeRemaining(null);
    loadQuiz();
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12">Loading quiz...</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button onClick={loadQuiz} className="mt-4 rounded-lg border px-4 py-2 hover:bg-muted">
          Try Again
        </button>
      </div>
    );
  }

  if (!quizData) return null;

  // Show results
  if (submitResult) {
    return (
      <QuizResults
        title={quizData.title}
        score={submitResult.score}
        totalQuestions={submitResult.totalQuestions}
        correctAnswers={submitResult.correctAnswers}
        passed={submitResult.passed}
        xpEarned={submitResult.xpEarned}
        leveledUp={submitResult.leveledUp}
        results={submitResult.results}
        questions={quizData.questions}
        onRetake={handleRetake}
        lessonUrl={lessonUrl}
      />
    );
  }

  const currentQuestion = quizData.questions[currentIndex];
  const allAnswered = quizData.questions.every((q) => q.id in answers);

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span>{quizData.title}</span>
          {timeRemaining !== null && (
            <span className="font-mono">
              {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}
            </span>
          )}
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${((Object.keys(answers).length) / quizData.totalQuestions) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <QuestionCard
        questionNumber={currentIndex + 1}
        totalQuestions={quizData.totalQuestions}
        question={currentQuestion}
        selectedAnswer={answers[currentQuestion.id]}
        onAnswer={handleAnswer}
      />

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="rounded-lg border px-4 py-2 transition-colors hover:bg-muted disabled:opacity-50"
        >
          Previous
        </button>

        <div className="hidden flex-wrap justify-center gap-2 sm:flex">
          {quizData.questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Question ${i + 1}${q.id in answers ? " (answered)" : ""}`}
              className={`h-8 w-8 rounded-full text-xs ${
                i === currentIndex
                  ? "bg-primary text-primary-foreground"
                  : q.id in answers
                    ? "bg-primary/20"
                    : "bg-muted"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground sm:hidden">
          {currentIndex + 1} / {quizData.totalQuestions}
        </span>

        {currentIndex < quizData.totalQuestions - 1 ? (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="rounded-lg border px-4 py-2 transition-colors hover:bg-muted"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="rounded-lg bg-primary px-6 py-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        )}
      </div>
    </div>
  );
}
