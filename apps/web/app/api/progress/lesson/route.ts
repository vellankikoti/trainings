import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId, updateLessonProgress } from "@/lib/progress";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { lessonProgressSchema, validateBody } from "@/lib/validations";

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
  const validated = validateBody(lessonProgressSchema, body);
  if (validated.error) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { pathSlug, moduleSlug, lessonSlug, status } = validated.data;

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
