import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import type { Json } from "@/lib/supabase/types";

/**
 * POST /api/events/batch
 *
 * Ingests a batch of tracking events from the client SDK.
 * Events are validated, enriched with server-side data, then inserted
 * into the append-only events table.
 */

const eventSchema = z.object({
  type: z.string().min(1).max(100),
  entityType: z.string().max(50).optional(),
  entityId: z.string().max(200).optional(),
  data: z.record(z.string(), z.any()).optional(),
  timestamp: z.number().int().positive(),
});

const batchSchema = z.object({
  events: z.array(eventSchema).min(1).max(50),
  sessionId: z.string().max(100).optional(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 60 requests/minute per user
  const rl = await rateLimit(`events:${userId}`, RATE_LIMITS.general);
  if (!rl.success) {
    return rateLimitResponse(rl);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = batchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { events, sessionId } = parsed.data;

  const supabase = createAdminClient();

  // Resolve profile ID from clerk_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Hash the IP for fraud detection (use forwarded header if behind proxy)
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = await hashIP(ip);

  // Transform client events into database rows
  const rows = events.map((event) => ({
    user_id: profile.id,
    event_type: event.type,
    entity_type: event.entityType ?? null,
    entity_id: event.entityId ?? null,
    data: (event.data ?? {}) as Json,
    session_id: sessionId ?? null,
    ip_hash: ipHash,
    created_at: new Date(event.timestamp).toISOString(),
  }));

  // Batch insert
  const { error } = await supabase.from("events").insert(rows);

  if (error) {
    console.error("[events/batch] Insert failed:", error.message);
    return NextResponse.json(
      { error: "Failed to store events" },
      { status: 500 }
    );
  }

  // Process time.heartbeat events — aggregate into active_time_log
  const heartbeats = events.filter((e) => e.type === "time.heartbeat");
  if (heartbeats.length > 0) {
    await processHeartbeats(supabase, profile.id, heartbeats);
  }

  // Update daily activity and last_activity_date
  await updateDailyActivity(supabase, profile.id);

  return NextResponse.json({
    success: true,
    count: rows.length,
  });
}

async function processHeartbeats(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  heartbeats: z.infer<typeof eventSchema>[]
) {
  for (const hb of heartbeats) {
    if (!hb.entityType || !hb.entityId || !hb.data?.activeSeconds) continue;

    const activeSeconds = Number(hb.data.activeSeconds);
    if (activeSeconds <= 0 || activeSeconds > 3600) continue; // Sanity check

    const now = new Date().toISOString();
    const sessionStart = new Date(
      hb.timestamp - activeSeconds * 1000
    ).toISOString();

    await supabase.from("active_time_log").insert({
      user_id: userId,
      entity_type: hb.entityType,
      entity_id: hb.entityId,
      session_start: sessionStart,
      session_end: now,
      active_seconds: activeSeconds,
    });
  }
}

async function updateDailyActivity(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string
) {
  const today = new Date().toISOString().split("T")[0];

  // Upsert daily_activity row for today
  await supabase.from("daily_activity").upsert(
    {
      user_id: userId,
      activity_date: today,
    },
    { onConflict: "user_id,activity_date" }
  );

  // Update last_activity_date on profile
  await supabase
    .from("profiles")
    .update({ last_activity_date: today })
    .eq("id", userId);
}

async function hashIP(ip: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoded = new TextEncoder().encode(ip + "_cte_salt");
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback — simple hash
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}
