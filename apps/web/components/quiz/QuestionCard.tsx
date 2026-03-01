"use client";

import { MatchingQuestion } from "./MatchingQuestion";
import { DebuggingQuestion } from "./DebuggingQuestion";

interface MatchingPair {
  left: string;
  right: string;
}

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: {
    id: string;
    type: string;
    question: string;
    options?: string[];
    matchingPairs?: MatchingPair[];
    codeSnippet?: string;
    codeLanguage?: string;
  };
  selectedAnswer: number | boolean | string | undefined;
  onAnswer: (answer: number | boolean | string) => void;
  disabled?: boolean;
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  selectedAnswer,
  onAnswer,
  disabled = false,
}: QuestionCardProps) {
  if (question.type === "matching") {
    return (
      <MatchingQuestion
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        question={question}
        selectedAnswer={selectedAnswer as string | undefined}
        onAnswer={onAnswer}
        disabled={disabled}
      />
    );
  }

  if (question.type === "debugging") {
    return (
      <DebuggingQuestion
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        question={question}
        selectedAnswer={selectedAnswer as number | undefined}
        onAnswer={onAnswer}
        disabled={disabled}
      />
    );
  }

  return (
    <div>
      <div className="mb-2 text-sm text-muted-foreground">
        Question {questionNumber} of {totalQuestions}
      </div>
      <h2 className="mb-6 text-xl font-semibold">{question.question}</h2>

      {question.type === "multiple_choice" && question.options && (
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={`w-full rounded-lg border p-4 text-left transition-colors ${
                selectedAnswer === index
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              onClick={() => !disabled && onAnswer(index)}
              disabled={disabled}
            >
              <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          ))}
        </div>
      )}

      {question.type === "true_false" && (
        <div className="flex gap-4">
          {[true, false].map((value) => (
            <button
              key={String(value)}
              className={`flex-1 rounded-lg border p-4 text-center transition-colors ${
                selectedAnswer === value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              onClick={() => !disabled && onAnswer(value)}
              disabled={disabled}
            >
              {value ? "True" : "False"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
