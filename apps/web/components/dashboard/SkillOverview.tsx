"use client";

import type { SkillScoreSummary } from "@/lib/dashboard";

const DOMAIN_LABELS: Record<string, string> = {
  linux: "Linux & Shell",
  networking: "Networking",
  containers: "Containers",
  kubernetes: "Kubernetes",
  cicd: "CI/CD",
  iac: "Infrastructure as Code",
  observability: "Observability",
  troubleshooting: "Troubleshooting",
};

function getScoreColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-yellow-500";
  if (score >= 20) return "bg-orange-500";
  return "bg-red-500";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Expert";
  if (score >= 60) return "Advanced";
  if (score >= 40) return "Intermediate";
  if (score >= 20) return "Beginner";
  return "Getting Started";
}

export function SkillOverview({ skills }: { skills: SkillScoreSummary[] }) {
  if (skills.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 p-8 text-center">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Skill Scores
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete lessons, labs, and quizzes to build your skill profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Skill Scores</h3>
      <div className="grid gap-3">
        {skills.map((skill) => (
          <div key={skill.domain} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {DOMAIN_LABELS[skill.domain] ?? skill.domain}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getScoreLabel(skill.compositeScore)}
                  {skill.percentile != null && (
                    <> &middot; Top {100 - skill.percentile}%</>
                  )}
                </p>
              </div>
              <span className="text-2xl font-bold tabular-nums">
                {Math.round(skill.compositeScore)}
              </span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-muted">
              <div
                className={`h-2 rounded-full transition-all ${getScoreColor(skill.compositeScore)}`}
                style={{ width: `${Math.min(100, skill.compositeScore)}%` }}
              />
            </div>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span>Theory: {Math.round(skill.theoryScore)}</span>
              <span>Labs: {Math.round(skill.labScore)}</span>
              <span>Quiz: {Math.round(skill.quizScore)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
