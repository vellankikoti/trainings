import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureProfile } from "@/lib/progress";
import { getFullDashboardData } from "@/lib/dashboard";
import { getUserBadges } from "@/lib/badges";
import { getXPHistory } from "@/lib/xp-rewards";
import { getStreakRecoveryInfo } from "@/lib/streaks";
import { ContinueLearning } from "@/components/dashboard/ContinueLearning";
import { StatsStrip } from "@/components/dashboard/StatsStrip";
import { MyCourses } from "@/components/dashboard/MyCourses";
import { PathProgress } from "@/components/dashboard/PathProgress";
import { SkillOverview } from "@/components/dashboard/SkillOverview";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { BadgeShowcase } from "@/components/dashboard/BadgeShowcase";
import { XPBreakdown } from "@/components/dashboard/XPBreakdown";
import { RecommendedNext } from "@/components/dashboard/RecommendedNext";
import { DashboardErrorBoundary } from "@/components/dashboard/DashboardError";
import {
  ContinueLearningSkeleton,
  RecommendedNextSkeleton,
  StatsStripSkeleton,
  StreakSkeleton,
  CoursesSkeleton,
  BadgesSkeleton,
  HeatmapSkeleton,
  BottomGridSkeleton,
} from "@/components/dashboard/DashboardSkeleton";

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

  // Ensure profile exists (auto-creates from Clerk data if missing)
  const profileId = await ensureProfile(clerkId);

  // Profile creation failed — shouldn't happen but handle gracefully
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

  return (
    <div className="space-y-8">
      {/* Header — renders immediately */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Continue your DevOps journey.
        </p>
      </div>

      {/* Main dashboard content with Suspense boundaries */}
      <DashboardErrorBoundary section="dashboard">
        <Suspense fallback={
          <>
            <ContinueLearningSkeleton />
            <RecommendedNextSkeleton />
            <StatsStripSkeleton />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <StreakSkeleton />
              <CoursesSkeleton />
            </div>
            <BadgesSkeleton />
            <HeatmapSkeleton />
            <BottomGridSkeleton />
          </>
        }>
          <DashboardContent profileId={profileId} />
        </Suspense>
      </DashboardErrorBoundary>
    </div>
  );
}

/** Async server component that fetches and renders all dashboard data */
async function DashboardContent({ profileId }: { profileId: string }) {
  const [data, badgeData, xpHistory, streakRecovery] = await Promise.all([
    getFullDashboardData(profileId),
    getUserBadges(profileId),
    getXPHistory(profileId),
    getStreakRecoveryInfo(profileId),
  ]);

  return (
    <>
      {/* Continue Learning Hero */}
      <DashboardErrorBoundary section="continue learning">
        <ContinueLearning resumeTarget={data.resumeTarget} />
      </DashboardErrorBoundary>

      {/* Recommended Next Actions */}
      <DashboardErrorBoundary section="recommendations">
        <RecommendedNext actions={data.recommendedNext} />
      </DashboardErrorBoundary>

      {/* Stats */}
      <DashboardErrorBoundary section="stats">
        <StatsStrip stats={data.stats} />
      </DashboardErrorBoundary>

      {/* Streak + Courses side by side on large screens */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardErrorBoundary section="streak">
          <StreakDisplay
            stats={data.stats}
            activityDays={data.activityHeatmap}
            streakRecovery={streakRecovery}
          />
        </DashboardErrorBoundary>
        <div className="lg:col-span-2">
          <DashboardErrorBoundary section="courses">
            <MyCourses
              activeCourses={data.activeCourses}
              completedCourses={data.completedCourses}
            />
          </DashboardErrorBoundary>
        </div>
      </div>

      {/* Badges */}
      <DashboardErrorBoundary section="badges">
        <BadgeShowcase
          earned={badgeData.earned}
          totalAvailable={badgeData.earned.length + badgeData.available.length}
        />
      </DashboardErrorBoundary>

      {/* Activity Heatmap */}
      <DashboardErrorBoundary section="activity heatmap">
        <ActivityHeatmap data={data.activityHeatmap} />
      </DashboardErrorBoundary>

      {/* XP Progress, Skill Scores & Path Progress */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <DashboardErrorBoundary section="XP breakdown">
          <XPBreakdown stats={data.stats} history={xpHistory} />
        </DashboardErrorBoundary>
        <DashboardErrorBoundary section="skill overview">
          <SkillOverview skills={data.skillScores} />
        </DashboardErrorBoundary>
        <DashboardErrorBoundary section="path progress">
          <PathProgress paths={data.pathProgress} />
        </DashboardErrorBoundary>
      </div>
    </>
  );
}
