"use client";

import { Card, CardContent } from "@/components/ui/card";

const OPTIONS = [
  {
    value: "career_change",
    label: "Career Change",
    description: "I want to transition into a DevOps/Cloud/SRE role",
  },
  {
    value: "upskill",
    label: "Upskill at Work",
    description: "I want to add DevOps skills to my current role",
  },
  {
    value: "curiosity",
    label: "Curiosity & Learning",
    description: "I want to understand how modern infrastructure works",
  },
  {
    value: "startup",
    label: "Build & Ship",
    description: "I want to deploy and manage my own projects",
  },
];

interface StepGoalProps {
  value: string;
  onChange: (value: string) => void;
}

export function StepGoal({ value, onChange }: StepGoalProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">What is your primary goal?</h2>
        <p className="mt-2 text-muted-foreground">
          We&apos;ll tailor your learning path to match your ambitions.
        </p>
      </div>
      <div className="grid gap-3">
        {OPTIONS.map((option) => (
          <Card
            key={option.value}
            className={`cursor-pointer transition-colors hover:border-primary ${
              value === option.value
                ? "border-primary bg-primary/5"
                : ""
            }`}
            onClick={() => onChange(option.value)}
          >
            <CardContent className="p-4">
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-muted-foreground">
                {option.description}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
