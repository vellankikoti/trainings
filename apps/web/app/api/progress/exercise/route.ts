import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureProfile, updateExerciseProgress } from "@/lib/progress";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { exerciseProgressSchema, validateBody } from "@/lib/validations";

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 30 requests/minute per user
  const rl = rateLimit(`progress:${clerkId}`, RATE_LIMITS.progress);
  if (!rl.success) {
    return rateLimitResponse(rl);
  }

  const body = await request.json();
  const validated = validateBody(exerciseProgressSchema, body);
  if (validated.error) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { lessonSlug, exerciseId } = validated.data;

  const profileId = await ensureProfile(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const result = await updateExerciseProgress(profileId, lessonSlug, exerciseId);
  return NextResponse.json(result);
}
