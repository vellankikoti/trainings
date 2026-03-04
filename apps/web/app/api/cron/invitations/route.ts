import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/cron/invitations — Expire stale invitations (Vercel Cron).
 *
 * Runs daily at midnight. Calls the `expire_stale_invitations()` RPC
 * which marks pending invitations past their `expires_at` as expired.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc("expire_stale_invitations");

    if (error) {
      console.error("[cron/invitations] RPC error:", error.message);
      return NextResponse.json({ error: "Failed to expire invitations" }, { status: 500 });
    }

    const expiredCount = data ?? 0;
    console.log(`[cron/invitations] Expired ${expiredCount} stale invitations`);

    return NextResponse.json({
      data: { expired_count: expiredCount },
    });
  } catch (err) {
    console.error("[cron/invitations] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
