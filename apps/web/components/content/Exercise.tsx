"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ExerciseProps {
  number?: number;
  title: string;
  children: React.ReactNode;
}

export function Exercise({ number, title, children }: ExerciseProps) {
  const [completed, setCompleted] = useState(false);

  return (
    <Card className={`my-6 ${completed ? "border-green-500/50" : ""}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCompleted(!completed)}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border text-sm ${
              completed
                ? "border-green-500 bg-green-500 text-white"
                : "border-muted-foreground"
            }`}
            aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
          >
            {completed && "✓"}
          </button>
          <h3 className="text-lg font-semibold">
            {number ? `Exercise ${number}: ` : ""}
            {title}
          </h3>
        </div>
        <div className="mt-3 pl-9">{children}</div>
      </CardContent>
    </Card>
  );
}
