import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getProfileId } from "@/lib/progress";
import { getMyCoursesData } from "@/lib/my-courses";
import { MyCoursesView } from "@/components/courses/MyCoursesView";
import { MyCoursesSkeleton } from "./loading";

export const metadata: Metadata = {
  title: "My Courses",
  description: "Track your progress and continue your DevOps learning journey.",
};

export default async function MyCoursesPage() {
  const [{ userId: clerkId }, user] = await Promise.all([
    auth(),
    currentUser(),
  ]);

  if (!clerkId) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          Please sign in to view your courses.
        </p>
      </div>
    );
  }

  const profileId = await getProfileId(clerkId);

  // New user — no profile yet
  if (!profileId) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            My Learning
          </h1>
          <p className="mt-2 text-muted-foreground">
            Start your DevOps journey today.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-border/60 px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h2 className="mt-5 text-lg font-bold">No courses yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Choose a learning path to get started on your DevOps journey.
          </p>
          <Link
            href="/paths"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
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
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          My Learning
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track your progress and continue your journey.
        </p>
      </div>

      {/* Content with Suspense */}
      <Suspense fallback={<MyCoursesSkeleton />}>
        <MyCoursesContent profileId={profileId} />
      </Suspense>
    </div>
  );
}

/** Async server component that fetches and renders course data */
async function MyCoursesContent({ profileId }: { profileId: string }) {
  const data = await getMyCoursesData(profileId);

  return <MyCoursesView data={data} />;
}
