"use client";

import { Card, CardContent } from "@/components/ui/card";

const OPTIONS = [
  {
    value: "beginner",
    label: "Complete Beginner",
    description: "I have little to no technical experience",
  },
  {
    value: "some_tech",
    label: "Some Technical Background",
    description: "I know basic programming or IT concepts",
  },
  {
    value: "developer",
    label: "Software Developer",
    description: "I write code professionally but new to DevOps",
  },
  {
    value: "some_devops",
    label: "Some DevOps Experience",
    description: "I have used Docker, CI/CD, or cloud services before",
  },
];

interface StepExperienceProps {
  value: string;
  onChange: (value: string) => void;
}

export function StepExperience({ value, onChange }: StepExperienceProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">What is your current experience?</h2>
        <p className="mt-2 text-muted-foreground">
          This helps us recommend the right starting point for you.
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
