"use client";

import { Card, CardContent } from "@/components/ui/card";

const OPTIONS = [
  {
    value: "1-5",
    label: "1-5 hours/week",
    description: "Casual pace — great for exploring at your own speed",
  },
  {
    value: "5-10",
    label: "5-10 hours/week",
    description: "Steady progress — you'll build real skills consistently",
  },
  {
    value: "10+",
    label: "10+ hours/week",
    description: "Intensive — fast-track your DevOps career",
  },
];

interface StepTimeProps {
  value: string;
  onChange: (value: string) => void;
}

export function StepTime({ value, onChange }: StepTimeProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          How much time can you dedicate per week?
        </h2>
        <p className="mt-2 text-muted-foreground">
          No pressure — you can always adjust this later.
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
