"use client";

import { useCallback, useEffect, useState } from "react";

interface MatchingPair {
  left: string;
  right: string;
}

interface MatchingQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: {
    id: string;
    question: string;
    matchingPairs?: MatchingPair[];
  };
  selectedAnswer: string | undefined;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

export function MatchingQuestion({
  questionNumber,
  totalQuestions,
  question,
  selectedAnswer,
  onAnswer,
  disabled = false,
}: MatchingQuestionProps) {
  const pairs = question.matchingPairs || [];
  const leftItems = pairs.map((p) => p.left);

  // Shuffle right items for display
  const [shuffledRight, setShuffledRight] = useState<string[]>([]);
  const [selections, setSelections] = useState<Record<number, number>>({});

  useEffect(() => {
    const rights = pairs.map((p) => p.right);
    // Fisher-Yates shuffle
    const shuffled = [...rights];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledRight(shuffled);

    // Restore selections from saved answer
    if (selectedAnswer) {
      try {
        const saved = JSON.parse(selectedAnswer) as number[];
        const restoredSelections: Record<number, number> = {};
        saved.forEach((rightIdx, leftIdx) => {
          restoredSelections[leftIdx] = rightIdx;
        });
        setSelections(restoredSelections);
      } catch {
        // ignore invalid saved state
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = useCallback(
    (leftIndex: number, rightIndex: number) => {
      if (disabled) return;

      const newSelections = { ...selections };

      // Remove any existing selection for this right item
      for (const [key, val] of Object.entries(newSelections)) {
        if (val === rightIndex) {
          delete newSelections[Number(key)];
        }
      }

      // Toggle: if already selected this pair, deselect
      if (selections[leftIndex] === rightIndex) {
        delete newSelections[leftIndex];
      } else {
        newSelections[leftIndex] = rightIndex;
      }

      setSelections(newSelections);

      // Convert to answer format: ordered array of right indices mapping to left indices
      if (Object.keys(newSelections).length === leftItems.length) {
        const answerArray = leftItems.map((_, i) => newSelections[i] ?? -1);
        onAnswer(JSON.stringify(answerArray));
      }
    },
    [disabled, selections, leftItems, onAnswer]
  );

  const getConnectionColor = (leftIndex: number): string => {
    if (selections[leftIndex] === undefined) return "";
    const colors = [
      "border-blue-500 bg-blue-500/10",
      "border-green-500 bg-green-500/10",
      "border-purple-500 bg-purple-500/10",
      "border-orange-500 bg-orange-500/10",
      "border-pink-500 bg-pink-500/10",
      "border-teal-500 bg-teal-500/10",
    ];
    return colors[leftIndex % colors.length];
  };

  const isRightSelected = (rightIndex: number): number | null => {
    for (const [leftIdx, rightIdx] of Object.entries(selections)) {
      if (rightIdx === rightIndex) return Number(leftIdx);
    }
    return null;
  };

  return (
    <div>
      <div className="mb-2 text-sm text-muted-foreground">
        Question {questionNumber} of {totalQuestions}
      </div>
      <h2 className="mb-4 text-xl font-semibold">{question.question}</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Click a left item, then click the matching right item to connect them.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase text-muted-foreground">Match from</div>
          {leftItems.map((item, leftIdx) => (
            <div
              key={`left-${leftIdx}`}
              className={`rounded-lg border p-3 text-sm transition-colors ${
                selections[leftIdx] !== undefined
                  ? getConnectionColor(leftIdx)
                  : "border-border"
              } ${disabled ? "opacity-60" : ""}`}
            >
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {leftIdx + 1}
              </span>
              {item}
            </div>
          ))}
        </div>

        {/* Right column */}
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase text-muted-foreground">Match to</div>
          {shuffledRight.map((item, rightIdx) => {
            const connectedLeft = isRightSelected(rightIdx);
            return (
              <button
                key={`right-${rightIdx}`}
                className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                  connectedLeft !== null
                    ? getConnectionColor(connectedLeft)
                    : "border-border hover:border-primary/50"
                } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                onClick={() => {
                  // Find the first unmatched left item, or the most recently interacted
                  const unmatchedLeft = leftItems.findIndex(
                    (_, i) => selections[i] === undefined
                  );
                  const targetLeft = unmatchedLeft >= 0 ? unmatchedLeft : 0;
                  handleSelect(targetLeft, rightIdx);
                }}
                disabled={disabled}
              >
                {connectedLeft !== null && (
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {connectedLeft + 1}
                  </span>
                )}
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
