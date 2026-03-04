import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { buildSearchIndex } from "@/lib/search";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

export async function GET() {
  // Rate limit search to prevent abuse (uses auth if available, falls back to general)
  const { userId } = await auth();
  const identifier = userId ? `search:${userId}` : `search:anonymous`;

  const rl = await rateLimit(identifier, RATE_LIMITS.general);
  if (!rl.success) {
    return rateLimitResponse(rl);
  }

  const index = buildSearchIndex();
  return NextResponse.json(index);
}
