import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId, updateExerciseProgress } from "@/lib/progress";

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { lessonSlug, exerciseId } = body;

  if (!lessonSlug || !exerciseId) {
    return NextResponse.json(
      { error: "Missing required fields: lessonSlug, exerciseId" },
      { status: 400 },
    );
  }

  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const result = await updateExerciseProgress(profileId, lessonSlug, exerciseId);
  return NextResponse.json(result);
}
