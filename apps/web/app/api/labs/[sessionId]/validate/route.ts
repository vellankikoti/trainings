import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/progress";
import {
  getLabSession,
  markExerciseCompleted,
  touchSession,
} from "@/lib/labs/container-manager";
import { validateExerciseById } from "@/lib/labs/validation-engine";
import { z } from "zod";
import { validateBody } from "@/lib/validations";

const validateSchema = z.object({
  exerciseId: z.string().min(1).max(200),
});

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

/**
 * POST /api/labs/[sessionId]/validate — Validate an exercise in the lab.
 *
 * Runs the exercise validation checks against the running container.
 * If the container is simulated (no real Docker), falls back to
 * marking the exercise as complete directly (MVP behavior).
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

  // Already completed — idempotent
  if (session.exercisesCompleted.includes(exerciseId)) {
    return NextResponse.json({
      exerciseId,
      passed: true,
      message: "Already completed",
      exercisesCompleted: session.exercisesCompleted,
    });
  }

  // Try real validation if a Docker container is attached
  if (session.containerId && !session.containerId.startsWith("container_")) {
    const result = await validateExerciseById(
      session.labType,
      exerciseId,
      session.containerId,
    );

    if (result.passed) {
      markExerciseCompleted(sessionId, exerciseId);
    }

    return NextResponse.json({
      exerciseId,
      passed: result.passed,
      message: result.message,
      exercisesCompleted: session.exercisesCompleted,
    });
  }

  // Fallback: simulated container — mark as complete directly
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
    message: "Validated (simulated environment)",
    exercisesCompleted: session.exercisesCompleted,
  });
}
