import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/progress";
import { createAdminClient } from "@/lib/supabase/server";

interface RouteParams {
  params: { quizId: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const supabase = createAdminClient();
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", profileId)
    .eq("quiz_id", params.quizId)
    .order("attempted_at", { ascending: false });

  return NextResponse.json({ attempts: attempts ?? [] });
}
