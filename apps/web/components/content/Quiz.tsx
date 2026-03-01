"use client";

import React, { useState, Children, isValidElement } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
      isValidElement(child),
  );

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const totalQuestions = questions.length;
  const correctCount = questions.filter((q, i) => {
    return answers[i] === q.props.answer;
  }).length;

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
    <Card className="my-6">
      <CardContent className="space-y-6 p-6">
        <h3 className="text-xl font-bold">Knowledge Check</h3>
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="space-y-2">
            <p className="font-medium">
              {qIndex + 1}. {q.props.question}
            </p>
            <div className="space-y-1 pl-4">
              {q.props.options.map((option, oIndex) => {
                const isSelected = answers[qIndex] === oIndex;
                const isCorrect = oIndex === q.props.answer;
                let optionClass = "border p-2 rounded cursor-pointer text-sm";

                if (submitted) {
                  if (isCorrect) {
                    optionClass +=
                      " border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
                  } else if (isSelected && !isCorrect) {
                    optionClass +=
                      " border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                  }
                } else if (isSelected) {
                  optionClass += " border-primary bg-primary/5";
                }

                return (
                  <button
                    key={oIndex}
                    className={`block w-full text-left ${optionClass}`}
                    onClick={() => handleSelect(qIndex, oIndex)}
                    disabled={submitted}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {submitted && q.props.explanation && (
              <p className="pl-4 text-sm text-muted-foreground">
                {q.props.explanation}
              </p>
            )}
          </div>
        ))}

        {submitted ? (
          <div className="flex items-center justify-between">
            <p className="font-semibold">
              Score: {correctCount} / {totalQuestions} correct
            </p>
            <Button variant="outline" onClick={handleRetake}>
              Retake Quiz
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < totalQuestions}
          >
            Check Answers
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function QuizQuestion({ children }: QuizQuestionProps) {
  return <>{children}</>;
}
