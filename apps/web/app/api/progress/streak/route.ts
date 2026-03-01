import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/progress";
import { updateStreak } from "@/lib/streaks";

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { activityType, xpEarned } = body;

  if (!activityType || xpEarned === undefined) {
    return NextResponse.json(
      { error: "Missing required fields: activityType, xpEarned" },
      { status: 400 },
    );
  }

  if (!["lesson", "exercise", "quiz"].includes(activityType)) {
    return NextResponse.json(
      { error: "activityType must be 'lesson', 'exercise', or 'quiz'" },
      { status: 400 },
    );
  }

  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const result = await updateStreak(profileId, activityType, xpEarned);
  return NextResponse.json(result);
}
