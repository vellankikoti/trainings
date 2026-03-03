import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureProfile } from "@/lib/progress";
import { getAllAchievements, checkAchievements } from "@/lib/achievements";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await ensureProfile(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Check for newly unlocked achievements, then return all
  const newlyUnlocked = await checkAchievements(profileId);
  const allAchievements = await getAllAchievements(profileId);

  return NextResponse.json({
    achievements: allAchievements,
    newlyUnlocked,
  });
}
