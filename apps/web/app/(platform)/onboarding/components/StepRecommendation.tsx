"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PATH_RECOMMENDATIONS: Record<
  string,
  { path: string; title: string; description: string; estimatedWeeks: number }
> = {
  beginner: {
    path: "foundations",
    title: "Foundations Path",
    description:
      "Start from the ground up with Linux, networking, Git, and shell scripting. You'll build a solid base before diving into containers and cloud.",
    estimatedWeeks: 12,
  },
  some_tech: {
    path: "foundations",
    title: "Foundations Path",
    description:
      "Solidify your base with Linux and Git, then move quickly into containerization. Your existing knowledge will help you progress faster.",
    estimatedWeeks: 8,
  },
  developer: {
    path: "containerization",
    title: "Containerization Path",
    description:
      "As a developer, you'll love Docker and Kubernetes. Learn to containerize your apps and deploy them to production-grade clusters.",
    estimatedWeeks: 10,
  },
  some_devops: {
    path: "platform-engineering",
    title: "Platform Engineering Path",
    description:
      "Level up your existing DevOps skills with Kubernetes, Helm, and platform engineering. Master production-grade orchestration and developer platforms.",
    estimatedWeeks: 8,
  },
};

interface StepRecommendationProps {
  experience: string;
  weeklyHours: string;
  goal: string;
}

export function StepRecommendation({
  experience,
  weeklyHours,
  goal,
}: StepRecommendationProps) {
  const recommendation = PATH_RECOMMENDATIONS[experience] || PATH_RECOMMENDATIONS.beginner;

  const hoursMultiplier = weeklyHours === "10+" ? 0.6 : weeklyHours === "5-10" ? 1 : 1.5;
  const adjustedWeeks = Math.round(recommendation.estimatedWeeks * hoursMultiplier);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Your Personalized Plan</h2>
        <p className="mt-2 text-muted-foreground">
          Based on your answers, here&apos;s what we recommend.
        </p>
      </div>
      <Card className="border-primary">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{recommendation.title}</h3>
            <Badge variant="secondary">Recommended</Badge>
          </div>
          <p className="text-muted-foreground">{recommendation.description}</p>
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4">
            <div>
              <div className="text-sm text-muted-foreground">Estimated Time</div>
              <div className="font-medium">~{adjustedWeeks} weeks</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Your Pace</div>
              <div className="font-medium">{weeklyHours} hrs/week</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Goal</div>
              <div className="font-medium capitalize">
                {goal.replace("_", " ")}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Starting Point</div>
              <div className="font-medium capitalize">
                {recommendation.path}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
