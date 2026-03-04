import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { buildSearchIndex } from "@/lib/search";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

/**
 * Cached search index — rebuilt at most once per 5 minutes.
 * Eliminates FS reads on every request.
 */
let cachedIndex: ReturnType<typeof buildSearchIndex> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await rateLimit(`search:${userId}`, RATE_LIMITS.general);
  if (!rl.success) {
    return rateLimitResponse(rl);
  }

  // Serve from in-memory cache if fresh
  const now = Date.now();
  if (!cachedIndex || now - cacheTimestamp > CACHE_TTL_MS) {
    cachedIndex = buildSearchIndex();
    cacheTimestamp = now;
  }

  return NextResponse.json(cachedIndex, {
    headers: {
      "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
    },
  });
}
