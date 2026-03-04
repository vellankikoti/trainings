import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileByClerkId, updateProfile } from "@/lib/profile";
import { ensureProfile } from "@/lib/progress";
import { profileUpdateSchema, validateBody } from "@/lib/validations";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let profile = await getProfileByClerkId(userId);

  // Auto-create profile if missing (webhook may have missed)
  if (!profile) {
    await ensureProfile(userId);
    profile = await getProfileByClerkId(userId);
  }

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile, {
    headers: {
      "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
    },
  });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validated = validateBody(profileUpdateSchema, body);
  if (validated.error) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const updated = await updateProfile(userId, validated.data);

  if (!updated) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 400 },
    );
  }

  return NextResponse.json(updated);
}
