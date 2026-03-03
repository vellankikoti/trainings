import type { Metadata } from "next";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getProfileId } from "@/lib/progress";
import { getFullDashboardData } from "@/lib/dashboard";
import { ContinueLearning } from "@/components/dashboard/ContinueLearning";
import { StatsStrip } from "@/components/dashboard/StatsStrip";
import { MyCourses } from "@/components/dashboard/MyCourses";
import { PathProgress } from "@/components/dashboard/PathProgress";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const [{ userId: clerkId }, user] = await Promise.all([
    auth(),
    currentUser(),
  ]);

  if (!clerkId) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  const profileId = await getProfileId(clerkId);

  // New user — no profile yet
  if (!profileId) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Start your DevOps journey today.
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-border/80 p-12 text-center">
          <h2 className="text-lg font-semibold">No progress yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a learning path to get started.
          </p>
          <Link
            href="/paths"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Browse Learning Paths
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  const data = await getFullDashboardData(profileId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Continue your DevOps journey.
        </p>
      </div>

      {/* Continue Learning Hero */}
      <ContinueLearning resumeTarget={data.resumeTarget} />

      {/* Stats */}
      <StatsStrip stats={data.stats} />

      {/* My Courses */}
      <MyCourses
        activeCourses={data.activeCourses}
        completedCourses={data.completedCourses}
      />

      {/* Learning Path Progress */}
      <PathProgress paths={data.pathProgress} />
    </div>
  );
}
