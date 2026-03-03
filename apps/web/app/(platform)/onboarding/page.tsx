"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StepExperience } from "./components/StepExperience";
import { StepTime } from "./components/StepTime";
import { StepGoal } from "./components/StepGoal";
import { StepAccount } from "./components/StepAccount";
import { StepRecommendation } from "./components/StepRecommendation";

const TOTAL_STEPS = 5;

function getRecommendedPath(experience: string): string {
  switch (experience) {
    case "some_devops":
      return "platform-engineering";
    case "developer":
      return "containerization";
    default:
      return "foundations";
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [experience, setExperience] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("");
  const [goal, setGoal] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [publicProfile, setPublicProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  const progress = (step / TOTAL_STEPS) * 100;

  const canProceed =
    (step === 1 && experience) ||
    (step === 2 && weeklyHours) ||
    (step === 3 && goal) ||
    step === 4 || // account step — display name is optional
    step === 5;

  async function handleComplete() {
    setSaving(true);
    try {
      const recommendedPath = getRecommendedPath(experience);

      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experience_level: experience,
          weekly_hours: weeklyHours,
          primary_goal: goal,
          recommended_path: recommendedPath,
          ...(displayName.trim() ? { display_name: displayName.trim() } : {}),
          public_profile: publicProfile,
        }),
      });

      // Navigate to the recommended path to start learning
      router.push(`/paths/${recommendedPath}`);
    } catch {
      setSaving(false);
    }
  }

  function handleSkip() {
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-muted-foreground">
            DEVOPS ENGINEERS
          </h1>
          <Progress value={progress} className="mt-4" />
          <p className="mt-2 text-sm text-muted-foreground">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>

        {step === 1 && (
          <StepExperience value={experience} onChange={setExperience} />
        )}
        {step === 2 && (
          <StepTime value={weeklyHours} onChange={setWeeklyHours} />
        )}
        {step === 3 && <StepGoal value={goal} onChange={setGoal} />}
        {step === 4 && (
          <StepAccount
            displayName={displayName}
            onDisplayNameChange={setDisplayName}
            publicProfile={publicProfile}
            onPublicProfileChange={setPublicProfile}
          />
        )}
        {step === 5 && (
          <StepRecommendation
            experience={experience}
            weeklyHours={weeklyHours}
            goal={goal}
          />
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={step === 1 ? handleSkip : () => setStep(step - 1)}
          >
            {step === 1 ? "Skip" : "Back"}
          </Button>
          {step < TOTAL_STEPS ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={saving}>
              {saving ? "Saving..." : "Start Learning"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
