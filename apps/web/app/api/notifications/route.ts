import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/progress";
import { getNotifications, getUnreadCount } from "@/lib/notifications";

/**
 * GET /api/notifications
 *
 * Returns the user's notifications and unread count.
 */
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(profileId),
    getUnreadCount(profileId),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}
