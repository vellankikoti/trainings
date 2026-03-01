import { NextResponse } from "next/server";
import { getPublicProfile } from "@/lib/profile";

export async function GET(
  _req: Request,
  { params }: { params: { username: string } },
) {
  const profile = await getPublicProfile(params.username);

  if (!profile) {
    return NextResponse.json(
      { error: "Profile not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(profile);
}
