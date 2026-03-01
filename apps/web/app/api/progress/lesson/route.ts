import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId, updateLessonProgress } from "@/lib/progress";

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { pathSlug, moduleSlug, lessonSlug, status } = body;

  if (!pathSlug || !moduleSlug || !lessonSlug || !status) {
    return NextResponse.json(
      { error: "Missing required fields: pathSlug, moduleSlug, lessonSlug, status" },
      { status: 400 },
    );
  }

  if (status !== "in_progress" && status !== "completed") {
    return NextResponse.json(
      { error: "Status must be 'in_progress' or 'completed'" },
      { status: 400 },
    );
  }

  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const result = await updateLessonProgress(
    profileId,
    pathSlug,
    moduleSlug,
    lessonSlug,
    status,
  );

  return NextResponse.json(result);
}
