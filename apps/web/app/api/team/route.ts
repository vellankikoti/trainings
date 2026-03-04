import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/progress";
import { getSubscription } from "@/lib/subscription";
import { getTeamMembers, getTeamStats } from "@/lib/team";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

/**
 * GET /api/team — Get team members and stats.
 * Only accessible to team plan subscribers.
 */
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await rateLimit(`team:${clerkId}`, RATE_LIMITS.general);
  if (!rl.success) {
    return rateLimitResponse(rl);
  }

  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Verify team plan
  const subscription = await getSubscription(profileId);
  if (subscription.plan !== "team") {
    return NextResponse.json(
      { error: "Team plan required" },
      { status: 403 },
    );
  }

  const [members, stats] = await Promise.all([
    getTeamMembers(profileId),
    getTeamStats(profileId),
  ]);

  return NextResponse.json({ members, stats });
}
