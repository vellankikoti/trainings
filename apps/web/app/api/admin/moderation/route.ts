import { NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth";
import {
  getFlaggedDiscussions,
  hideDiscussion,
  unflagDiscussion,
} from "@/lib/discussions";
import { z } from "zod";
import { validateBody } from "@/lib/validations";

const moderationActionSchema = z.object({
  discussionId: z.string().uuid(),
  action: z.enum(["hide", "dismiss", "delete"]),
});

/**
 * GET /api/admin/moderation — Get all flagged discussions.
 * Requires trainer, admin, or super_admin role.
 */
export async function GET() {
  try {
    await requireRole("trainer", "institute_admin", "admin", "super_admin");
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const flagged = await getFlaggedDiscussions();
    return NextResponse.json({ discussions: flagged, total: flagged.length });
  } catch (error) {
    console.error("Moderation fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch flagged discussions" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/moderation — Take moderation action on a discussion.
 *
 * Actions:
 * - "hide": Soft-delete the discussion (remove from public view)
 * - "dismiss": Unflag the discussion (false positive)
 * - "delete": Same as "hide" (soft-delete)
 */
export async function POST(request: Request) {
  try {
    await requireRole("trainer", "institute_admin", "admin", "super_admin");
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validated = validateBody(moderationActionSchema, body);
  if (validated.error) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { discussionId, action } = validated.data;

  try {
    let success = false;

    switch (action) {
      case "hide":
      case "delete":
        success = await hideDiscussion(discussionId);
        break;
      case "dismiss":
        success = await unflagDiscussion(discussionId);
        break;
    }

    return NextResponse.json({
      success,
      action,
      discussionId,
    });
  } catch (error) {
    console.error("Moderation action error:", error);
    return NextResponse.json(
      { error: "Failed to perform moderation action" },
      { status: 500 },
    );
  }
}
