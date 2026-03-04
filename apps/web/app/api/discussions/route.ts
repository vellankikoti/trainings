import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/progress";
import { getDiscussions, createDiscussion } from "@/lib/discussions";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";
import { validateBody } from "@/lib/validations";

const createSchema = z.object({
  lessonSlug: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  parentId: z.string().uuid().optional(),
});

/**
 * GET /api/discussions?lessonSlug=xxx — Get discussions for a lesson.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lessonSlug = searchParams.get("lessonSlug");

  if (!lessonSlug) {
    return NextResponse.json(
      { error: "Missing lessonSlug parameter" },
      { status: 400 },
    );
  }

  const discussions = await getDiscussions(lessonSlug);
  return NextResponse.json({ discussions });
}

/**
 * POST /api/discussions — Create a new discussion or reply.
 */
export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: general rate
  const rl = await rateLimit(`discussions:${clerkId}`, RATE_LIMITS.general);
  if (!rl.success) {
    return rateLimitResponse(rl);
  }

  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const body = await request.json();
  const validated = validateBody(createSchema, body);
  if (validated.error) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { lessonSlug, content, parentId } = validated.data;

  const discussion = await createDiscussion(
    profileId,
    lessonSlug,
    content,
    parentId,
  );

  if (!discussion) {
    return NextResponse.json(
      { error: "Failed to create discussion" },
      { status: 500 },
    );
  }

  return NextResponse.json(discussion, { status: 201 });
}
