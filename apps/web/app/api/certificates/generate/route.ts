import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/progress";
import { generateCertificate } from "@/lib/certificates";

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
  const { type, title, pathSlug, moduleSlug, description } = body;

  if (!type || !title) {
    return NextResponse.json(
      { error: "Missing required fields: type, title" },
      { status: 400 },
    );
  }

  try {
    const result = await generateCertificate(profileId, type, title, {
      pathSlug,
      moduleSlug,
      description,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate certificate" },
      { status: 400 },
    );
  }
}
