import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/progress";
import { createLabSession, getActiveSessionForUser, LAB_CONFIGS } from "@/lib/labs/container-manager";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { hasRemainingLabSessions } from "@/lib/subscription";
import { z } from "zod";
import { validateBody } from "@/lib/validations";

const createSessionSchema = z.object({
  labType: z.string().min(1).max(100),
});

/**
 * POST /api/labs/session — Create a new lab session.
 * GET /api/labs/session — Get current active session.
 */
export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 5 requests/hour
  const rl = rateLimit(`lab-session:${clerkId}`, RATE_LIMITS.labSession);
  if (!rl.success) {
    return rateLimitResponse(rl);
  }

  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const body = await request.json();
  const validated = validateBody(createSessionSchema, body);
  if (validated.error) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { labType } = validated.data;

  // Validate lab type
  if (!LAB_CONFIGS[labType]) {
    return NextResponse.json(
      { error: `Unknown lab type: ${labType}` },
      { status: 400 },
    );
  }

  // Check lab session limits for free users
  const labAccess = await hasRemainingLabSessions(profileId);
  if (!labAccess.allowed) {
    return NextResponse.json(
      {
        error: "Lab session limit reached",
        used: labAccess.used,
        limit: labAccess.limit,
      },
      { status: 403 },
    );
  }

  try {
    const session = await createLabSession(profileId, labType);

    return NextResponse.json({
      sessionId: session.sessionId,
      status: session.status,
      wsUrl: session.wsUrl,
      labType: session.labType,
      createdAt: session.createdAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create lab session";

    if (message.includes("already have an active")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const session = getActiveSessionForUser(profileId);

  if (!session) {
    return NextResponse.json({ session: null });
  }

  return NextResponse.json({
    sessionId: session.sessionId,
    status: session.status,
    wsUrl: session.wsUrl,
    labType: session.labType,
    createdAt: session.createdAt,
    exercisesCompleted: session.exercisesCompleted,
  });
}
