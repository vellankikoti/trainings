import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/progress";
import {
  getLabSession,
  markExerciseCompleted,
  touchSession,
} from "@/lib/labs/container-manager";
import { z } from "zod";
import { validateBody } from "@/lib/validations";

const validateSchema = z.object({
  exerciseId: z.string().min(1).max(200),
  validationCommand: z.string().min(1).max(1000).optional(),
});

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

/**
 * POST /api/labs/[sessionId]/validate — Validate an exercise in the lab.
 *
 * In production, this would run the validation command inside the Docker
 * container and check the exit code. For MVP, it accepts the validation
 * and marks the exercise as complete.
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

  // Verify ownership
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
  const validated = validateBody(validateSchema, body);
  if (validated.error) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { exerciseId } = validated.data;

  // Update activity timestamp
  touchSession(sessionId);

  // In production, this would:
  // 1. Execute the validation command in the Docker container
  // 2. Check the exit code
  // 3. Capture stdout/stderr for feedback
  //
  // For MVP, we mark the exercise as complete directly.
  const success = markExerciseCompleted(sessionId, exerciseId);

  if (!success) {
    return NextResponse.json(
      { error: "Failed to validate exercise" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    exerciseId,
    passed: true,
    exercisesCompleted: session.exercisesCompleted,
  });
}
