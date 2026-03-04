import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureProfile, getPathProgress } from "@/lib/progress";

interface RouteParams {
  params: { slug: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await ensureProfile(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const result = await getPathProgress(profileId, params.slug);
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
    },
  });
}
