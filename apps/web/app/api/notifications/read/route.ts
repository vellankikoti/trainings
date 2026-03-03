import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/progress";
import { markAsRead, markAllAsRead } from "@/lib/notifications";
import { notificationReadSchema, validateBody } from "@/lib/validations";

/**
 * POST /api/notifications/read
 *
 * Mark notification(s) as read.
 * Body: { notificationId: string } or { all: true }
 */
export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const body = await request.json();
  const { data: validated, error } = validateBody(notificationReadSchema, body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  if (validated.all === true) {
    await markAllAsRead(profileId);
  } else {
    await markAsRead(profileId, validated.notificationId);
  }

  return NextResponse.json({ success: true });
}
