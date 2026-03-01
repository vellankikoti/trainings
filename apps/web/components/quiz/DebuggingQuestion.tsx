"use client";

interface DebuggingQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: {
    id: string;
    question: string;
    codeSnippet?: string;
    codeLanguage?: string;
    options?: string[];
  };
  selectedAnswer: number | undefined;
  onAnswer: (answer: number) => void;
  disabled?: boolean;
}

export function DebuggingQuestion({
  questionNumber,
  totalQuestions,
  question,
  selectedAnswer,
  onAnswer,
  disabled = false,
}: DebuggingQuestionProps) {
  return (
    <div>
      <div className="mb-2 text-sm text-muted-foreground">
        Question {questionNumber} of {totalQuestions}
      </div>
      <h2 className="mb-4 text-xl font-semibold">{question.question}</h2>

      {/* Code/Log snippet */}
      {question.codeSnippet && (
        <div className="mb-6">
          <div className="flex items-center justify-between rounded-t-lg border border-b-0 bg-muted px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground">
              {question.codeLanguage || "output"}
            </span>
            <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              Bug
            </span>
          </div>
          <pre className="overflow-x-auto rounded-b-lg border bg-[#1e1e2e] p-4 font-mono text-sm text-[#cdd6f4]">
            <code>{question.codeSnippet}</code>
          </pre>
        </div>
      )}

      {/* Answer options */}
      <p className="mb-3 text-sm font-medium">What is the root cause?</p>
      {question.options && (
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
    </div>
  );
}
