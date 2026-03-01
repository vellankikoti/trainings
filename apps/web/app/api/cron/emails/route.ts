import { NextResponse } from "next/server";
import {
  processWelcomeSequence,
  processInactiveUserEmails,
} from "@/lib/email-automation";

/**
 * POST /api/cron/emails — Process automated email sequences.
 * Secured via CRON_SECRET header (set in Vercel cron config).
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  try {
    results.welcome = await processWelcomeSequence();
  } catch (error) {
    results.welcome = {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  try {
    results.inactive = await processInactiveUserEmails();
  } catch (error) {
    results.inactive = {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  return NextResponse.json({
    status: "processed",
    timestamp: new Date().toISOString(),
    results,
  });
}
