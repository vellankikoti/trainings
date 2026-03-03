import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/progress";
import { getLabSession, touchSession } from "@/lib/labs/container-manager";
import {
  revealHint,
  getRevealedHints,
  getTotalHintsUsed,
} from "@/lib/labs/hint-system";
import { z } from "zod";
import { validateBody } from "@/lib/validations";

const hintRequestSchema = z.object({
  exerciseId: z.string().min(1).max(200),
});

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

/**
 * POST /api/labs/[sessionId]/hints — Reveal the next hint for an exercise.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const session = getLabSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const profileId = await getProfileId(clerkId);
  if (session.userId !== profileId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (session.status !== "running") {
    return NextResponse.json(
      { error: "Session is not running" },
      { status: 400 },
    );
  }

  const body = await request.json();
  const validated = validateBody(hintRequestSchema, body);
  if (validated.error) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { exerciseId } = validated.data;

  touchSession(sessionId);

  const result = revealHint(sessionId, session.labType, exerciseId);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ...result,
    totalSessionHints: getTotalHintsUsed(sessionId),
  });
}

/**
 * GET /api/labs/[sessionId]/hints?exerciseId=xxx — Get revealed hints.
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const session = getLabSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const profileId = await getProfileId(clerkId);
  if (session.userId !== profileId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(request.url);
  const exerciseId = url.searchParams.get("exerciseId");

  if (!exerciseId) {
    return NextResponse.json(
      { error: "exerciseId query parameter is required" },
      { status: 400 },
    );
  }

  const hints = getRevealedHints(sessionId, session.labType, exerciseId);
  const totalHintsUsed = getTotalHintsUsed(sessionId);

  return NextResponse.json({
    exerciseId,
    hints,
    hintsRevealed: hints.length,
    totalSessionHints: totalHintsUsed,
  });
}
