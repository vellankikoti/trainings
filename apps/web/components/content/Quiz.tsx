"use client";

import React, { useState, Children, isValidElement } from "react";

interface QuizProps {
  children: React.ReactNode;
}

interface QuizQuestionProps {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
  children?: React.ReactNode;
}

export function Quiz({ children }: QuizProps) {
  const questions = Children.toArray(children).filter(
    (child): child is React.ReactElement<QuizQuestionProps> =>
      isValidElement(child) && child.props.options,
  );

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (questions.length === 0) return null;

  const totalQuestions = questions.length;
  const correctCount = questions.filter((q, i) => {
    return answers[i] === q.props.answer;
  }).length;
  const answeredCount = Object.keys(answers).length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  function handleSelect(questionIndex: number, optionIndex: number) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  function handleRetake() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.4V19a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1.6c2.9-1.1 5-4 5-7.4a8 8 0 0 0-8-8z" />
              <path d="M10 22h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Knowledge Check</h3>
            <p className="text-xs text-muted-foreground">
              {submitted
                ? `${correctCount} of ${totalQuestions} correct`
                : `${answeredCount} of ${totalQuestions} answered`}
            </p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {questions.map((_, i) => {
            let dotClass = "h-2 w-2 rounded-full transition-colors ";
            if (submitted) {
              dotClass += answers[i] === questions[i].props.answer
                ? "bg-emerald-500"
                : "bg-red-400";
            } else if (answers[i] !== undefined) {
              dotClass += "bg-primary";
            } else {
              dotClass += "bg-border";
            }
            return <div key={i} className={dotClass} />;
          })}
        </div>
      </div>

      {/* Questions */}
      <div className="divide-y divide-border/40">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="p-5">
            <p className="mb-3 text-[0.938rem] font-semibold text-foreground">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {qIndex + 1}
              </span>
              {q.props.question}
            </p>
            <div className="space-y-2 pl-8">
              {(q.props.options || []).map((option, oIndex) => {
                const isSelected = answers[qIndex] === oIndex;
                const isCorrect = oIndex === q.props.answer;

                let optionClass =
                  "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-all cursor-pointer ";

                if (submitted) {
                  if (isCorrect) {
                    optionClass +=
                      "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
                  } else if (isSelected && !isCorrect) {
                    optionClass +=
                      "border-red-400/50 bg-red-500/10 text-red-700 dark:text-red-300";
                  } else {
                    optionClass += "border-border/50 text-muted-foreground opacity-60";
                  }
                } else if (isSelected) {
                  optionClass +=
                    "border-primary bg-primary/5 text-foreground ring-1 ring-primary/20";
                } else {
                  optionClass +=
                    "border-border/50 text-foreground hover:border-primary/30 hover:bg-muted/50";
                }

                return (
                  <button
                    key={oIndex}
                    className={`block w-full text-left ${optionClass}`}
                    onClick={() => handleSelect(qIndex, oIndex)}
                    disabled={submitted}
                  >
                    {/* Radio circle */}
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        submitted && isCorrect
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : submitted && isSelected && !isCorrect
                            ? "border-red-400 bg-red-400 text-white"
                            : isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-muted-foreground/30"
                      }`}
                    >
                      {submitted && isCorrect && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                      {submitted && isSelected && !isCorrect && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      )}
                      {!submitted && isSelected && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
            {submitted && q.props.explanation && (
              <div className="mt-3 ml-8 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <span className="font-semibold">Explanation:</span> {q.props.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border/60 bg-muted/20 px-5 py-4">
        {submitted ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Score ring */}
              <div className="relative h-12 w-12">
                <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${scorePercent * 1.257} 125.7`}
                    strokeLinecap="round"
                    className={scorePercent >= 70 ? "text-emerald-500" : scorePercent >= 40 ? "text-amber-500" : "text-red-400"}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {scorePercent}%
                </span>
              </div>
              <div>
                <p className="font-semibold">
                  {scorePercent === 100
                    ? "Perfect Score!"
                    : scorePercent >= 70
                      ? "Great Job!"
                      : scorePercent >= 40
                        ? "Keep Practicing"
                        : "Review the Material"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {correctCount} of {totalQuestions} correct
                </p>
              </div>
            </div>
            <button
              onClick={handleRetake}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
              Retake
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={answeredCount < totalQuestions}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Check Answers
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function QuizQuestion({ children }: QuizQuestionProps) {
  return <>{children}</>;
}
