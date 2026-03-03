import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/profile/delete-request
 *
 * Initiates an account deletion request (GDPR right to erasure).
 * Marks the profile with a `deletion_requested_at` timestamp.
 * Actual deletion is handled manually by an administrator for now.
 */
export async function POST() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Resolve the Supabase profile from the Clerk ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, deletion_requested_at")
      .eq("clerk_id", clerkId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 },
      );
    }

    // Check if a deletion request is already pending
    if (profile.deletion_requested_at) {
      return NextResponse.json(
        {
          message: "Account deletion has already been requested.",
          deletion_requested_at: profile.deletion_requested_at,
        },
        { status: 200 },
      );
    }

    // Mark the profile with the deletion request timestamp
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ deletion_requested_at: now })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Failed to mark deletion request:", updateError);
      return NextResponse.json(
        { error: "Failed to process deletion request" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message:
          "Account deletion request received. Your account and all associated data will be permanently deleted within 30 days. You may contact support to cancel this request.",
        deletion_requested_at: now,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Deletion request error:", err);
    return NextResponse.json(
      { error: "Failed to process deletion request" },
      { status: 500 },
    );
  }
}
