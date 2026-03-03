import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureProfile, getDashboardData } from "@/lib/progress";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await ensureProfile(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const data = await getDashboardData(profileId);
  return NextResponse.json(data);
}
