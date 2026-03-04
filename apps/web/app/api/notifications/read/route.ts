import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/progress";
import { markAsRead, markAllAsRead } from "@/lib/notifications";
import { notificationReadSchema, validateBody } from "@/lib/validations";
import { apiErrors, withLogging } from "@/lib/api-helpers";

/**
 * POST /api/notifications/read
 *
 * Mark notification(s) as read.
 * Body: { notificationId: string } or { all: true }
 */
export const POST = withLogging(async (request: Request) => {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return apiErrors.unauthorized();
  }

  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return apiErrors.notFound("Profile");
  }

  const body = await request.json();
  const { data: validated, error } = validateBody(notificationReadSchema, body);
  if (error) {
    return apiErrors.badRequest(error);
  }

  if (validated.all === true) {
    await markAllAsRead(profileId);
  } else {
    await markAsRead(profileId, validated.notificationId);
  }

  return NextResponse.json({ success: true });
});
