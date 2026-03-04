import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/progress";
import {
  deleteDiscussion,
  flagDiscussion,
  hideDiscussion,
  unflagDiscussion,
  voteDiscussion,
} from "@/lib/discussions";
import { getAuthContext } from "@/lib/auth";
import { z } from "zod";
import { validateBody } from "@/lib/validations";
import { apiErrors, withLogging } from "@/lib/api-helpers";

interface RouteParams {
  params: Promise<{ discussionId: string }>;
}

const voteSchema = z.object({
  voteType: z.enum(["upvote", "downvote"]),
});

const MODERATOR_ROLES = ["trainer", "institute_admin", "admin", "super_admin"];

const actionSchema = z.object({
  action: z.enum(["flag", "vote", "hide", "dismiss"]),
  voteType: z.enum(["upvote", "downvote"]).optional(),
});

/**
 * PATCH /api/discussions/[discussionId] — Flag or vote on a discussion.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return apiErrors.unauthorized();
  }

  const { discussionId } = await params;
  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return apiErrors.notFound("Profile");
  }

  const body = await request.json();
  const validated = validateBody(actionSchema, body);
  if (validated.error) {
    return apiErrors.badRequest(validated.error);
  }

  const { action, voteType } = validated.data;

  if (action === "flag") {
    const success = await flagDiscussion(discussionId);
    return NextResponse.json({ success });
  }

  if (action === "vote" && voteType) {
    const voteValidated = validateBody(voteSchema, { voteType });
    if (voteValidated.error) {
      return apiErrors.badRequest(voteValidated.error);
    }
    const success = await voteDiscussion(discussionId, profileId, voteType);
    return NextResponse.json({ success });
  }

  // Moderation actions — require elevated role
  if (action === "hide" || action === "dismiss") {
    try {
      const ctx = await getAuthContext();
      if (!ctx || !MODERATOR_ROLES.includes(ctx.role)) {
        return apiErrors.forbidden();
      }
    } catch {
      return apiErrors.forbidden();
    }

    const success =
      action === "hide"
        ? await hideDiscussion(discussionId)
        : await unflagDiscussion(discussionId);
    return NextResponse.json({ success });
  }

  return apiErrors.badRequest("Invalid action");
}

/**
 * DELETE /api/discussions/[discussionId] — Soft-delete a discussion (owner only).
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return apiErrors.unauthorized();
  }

  const { discussionId } = await params;
  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return apiErrors.notFound("Profile");
  }

  const success = await deleteDiscussion(discussionId, profileId);
  return NextResponse.json({ success });
}
