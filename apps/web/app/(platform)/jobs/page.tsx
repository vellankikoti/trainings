import { JobBoard } from "./job-board";

export const metadata = {
  title: "Job Board",
  description: "Find DevOps and cloud engineering jobs matched to your skills.",
};

export default function JobBoardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Job Board</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover opportunities matched to your skills.
        </p>
      </div>
      <JobBoard />
    </div>
  );
}
