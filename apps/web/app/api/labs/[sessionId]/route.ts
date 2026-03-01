import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/progress";
import { getLabSession, destroyLabSession } from "@/lib/labs/container-manager";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

/**
 * GET /api/labs/[sessionId] — Get session status.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const session = getLabSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Verify the session belongs to this user
  const profileId = await getProfileId(clerkId);
  if (session.userId !== profileId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json({
    sessionId: session.sessionId,
    status: session.status,
    labType: session.labType,
    createdAt: session.createdAt,
    lastActivityAt: session.lastActivityAt,
    exercisesCompleted: session.exercisesCompleted,
  });
}

/**
 * DELETE /api/labs/[sessionId] — Stop and remove a session.
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
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

  await destroyLabSession(sessionId);

  return NextResponse.json({ status: "stopped" });
}
