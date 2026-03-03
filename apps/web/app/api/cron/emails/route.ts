import { NextResponse } from "next/server";
import {
  processWelcomeSequence,
  processInactiveUserEmails,
  processMonthlySummaries,
} from "@/lib/email-automation";

/**
 * POST /api/cron/emails — Process automated email sequences.
 * Secured via CRON_SECRET header (set in Vercel cron config).
 *
 * Runs daily at 9 AM UTC:
 * - Welcome sequence (day 3, day 7)
 * - Inactive user re-engagement (7, 14, 30 days)
 * - Monthly summaries (1st of each month)
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

  // Monthly summaries — only run on the 1st of each month
  const today = new Date();
  if (today.getUTCDate() === 1) {
    try {
      results.monthly = await processMonthlySummaries();
    } catch (error) {
      results.monthly = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  return NextResponse.json({
    status: "processed",
    timestamp: new Date().toISOString(),
    results,
  });
}

/**
 * GET handler — Vercel cron calls GET by default.
 */
export async function GET(request: Request) {
  return POST(request);
}
