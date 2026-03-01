import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/progress";
import { deleteDiscussion, flagDiscussion, voteDiscussion } from "@/lib/discussions";
import { z } from "zod";
import { validateBody } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ discussionId: string }>;
}

const voteSchema = z.object({
  voteType: z.enum(["upvote", "downvote"]),
});

const actionSchema = z.object({
  action: z.enum(["flag", "vote"]),
  voteType: z.enum(["upvote", "downvote"]).optional(),
});

/**
 * PATCH /api/discussions/[discussionId] — Flag or vote on a discussion.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { discussionId } = await params;
  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const body = await request.json();
  const validated = validateBody(actionSchema, body);
  if (validated.error) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { action, voteType } = validated.data;

  if (action === "flag") {
    const success = await flagDiscussion(discussionId);
    return NextResponse.json({ success });
  }

  if (action === "vote" && voteType) {
    const voteValidated = validateBody(voteSchema, { voteType });
    if (voteValidated.error) {
      return NextResponse.json({ error: voteValidated.error }, { status: 400 });
    }
    const success = await voteDiscussion(discussionId, profileId, voteType);
    return NextResponse.json({ success });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

/**
 * DELETE /api/discussions/[discussionId] — Soft-delete a discussion (owner only).
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { discussionId } = await params;
  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const success = await deleteDiscussion(discussionId, profileId);
  return NextResponse.json({ success });
}
