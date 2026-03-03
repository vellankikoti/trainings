import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureProfile, getModuleProgress } from "@/lib/progress";

interface RouteParams {
  params: { slug: string };
}

export async function GET(request: Request, { params }: RouteParams) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const pathSlug = url.searchParams.get("path");

  if (!pathSlug) {
    return NextResponse.json(
      { error: "Missing required query param: path" },
      { status: 400 },
    );
  }

  const profileId = await ensureProfile(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const result = await getModuleProgress(profileId, pathSlug, params.slug);
  return NextResponse.json(result);
}
