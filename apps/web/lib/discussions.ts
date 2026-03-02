import { createAdminClient } from "@/lib/supabase/server";

export interface Discussion {
  id: string;
  userId: string;
  lessonSlug: string;
  parentId: string | null;
  content: string;
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    displayName: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
  upvotes: number;
  downvotes: number;
  replies?: Discussion[];
}

/**
 * Get discussions for a lesson.
 */
export async function getDiscussions(
  lessonSlug: string,
): Promise<Discussion[]> {
  const supabase = createAdminClient();

  // Get top-level discussions (no parent)
  const { data, error } = (await (supabase
    .from("discussions") as any)
    .select(`
      id,
      user_id,
      lesson_slug,
      parent_id,
      content,
      is_flagged,
      created_at,
      updated_at,
      profiles!discussions_user_id_fkey (
        display_name,
        username,
        avatar_url
      )
    `)
    .eq("lesson_slug", lessonSlug)
    .eq("is_deleted", false)
    .is("parent_id", null)
    .order("created_at", { ascending: false })
    .limit(50)) as any;

  if (error || !data) {
    console.error("Failed to fetch discussions:", error);
    return [];
  }

  // Get vote counts for all discussions
  const discussionIds = (data as any[]).map((d: any) => d.id);
  const { data: votes } = (await (supabase
    .from("discussion_votes") as any)
    .select("discussion_id, vote_type")
    .in("discussion_id", discussionIds)) as any;

  const voteCounts = new Map<string, { upvotes: number; downvotes: number }>();
  for (const vote of votes || []) {
    const current = voteCounts.get(vote.discussion_id) || { upvotes: 0, downvotes: 0 };
    if (vote.vote_type === "upvote") current.upvotes++;
    else current.downvotes++;
    voteCounts.set(vote.discussion_id, current);
  }

  // Get replies for all discussions
  const { data: replies } = (await (supabase
    .from("discussions") as any)
    .select(`
      id,
      user_id,
      lesson_slug,
      parent_id,
      content,
      is_flagged,
      created_at,
      updated_at,
      profiles!discussions_user_id_fkey (
        display_name,
        username,
        avatar_url
      )
    `)
    .eq("lesson_slug", lessonSlug)
    .eq("is_deleted", false)
    .in("parent_id", discussionIds)
    .order("created_at", { ascending: true })) as any;

  const repliesMap = new Map<string, Discussion[]>();
  for (const reply of replies || []) {
    const profile = reply.profiles as unknown as {
      display_name: string | null;
      username: string | null;
      avatar_url: string | null;
    };
    const parentReplies = repliesMap.get(reply.parent_id!) || [];
    parentReplies.push({
      id: reply.id,
      userId: reply.user_id,
      lessonSlug: reply.lesson_slug,
      parentId: reply.parent_id,
      content: reply.content,
      isFlagged: reply.is_flagged,
      createdAt: reply.created_at,
      updatedAt: reply.updated_at,
      author: profile
        ? {
          displayName: profile.display_name,
          username: profile.username,
          avatarUrl: profile.avatar_url,
        }
        : undefined,
      upvotes: 0,
      downvotes: 0,
    });
    repliesMap.set(reply.parent_id!, parentReplies);
  }

  return (data as any[]).map((d: any) => {
    const profile = d.profiles as unknown as {
      display_name: string | null;
      username: string | null;
      avatar_url: string | null;
    };
    const counts = voteCounts.get(d.id) || { upvotes: 0, downvotes: 0 };

    return {
      id: d.id,
      userId: d.user_id,
      lessonSlug: d.lesson_slug,
      parentId: d.parent_id,
      content: d.content,
      isFlagged: d.is_flagged,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      author: profile
        ? {
          displayName: profile.display_name,
          username: profile.username,
          avatarUrl: profile.avatar_url,
        }
        : undefined,
      upvotes: counts.upvotes,
      downvotes: counts.downvotes,
      replies: repliesMap.get(d.id) || [],
    };
  });
}

/**
 * Create a new discussion or reply.
 */
export async function createDiscussion(
  userId: string,
  lessonSlug: string,
  content: string,
  parentId?: string,
): Promise<Discussion | null> {
  const supabase = createAdminClient();

  const { data, error } = (await (supabase
    .from("discussions") as any)
    .insert({
      user_id: userId,
      lesson_slug: lessonSlug,
      content,
      parent_id: parentId || null,
    })
    .select("*")
    .single()) as any;

  if (error || !data) {
    console.error("Failed to create discussion:", error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    lessonSlug: data.lesson_slug,
    parentId: data.parent_id,
    content: data.content,
    isFlagged: data.is_flagged,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    upvotes: 0,
    downvotes: 0,
  };
}

/**
 * Flag a discussion for moderation.
 */
export async function flagDiscussion(discussionId: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = (await (supabase
    .from("discussions") as any)
    .update({ is_flagged: true })
    .eq("id", discussionId)) as any;

  return !error;
}

/**
 * Soft-delete a discussion (admin or owner).
 */
export async function deleteDiscussion(
  discussionId: string,
  userId: string,
): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = (await (supabase
    .from("discussions") as any)
    .update({ is_deleted: true })
    .eq("id", discussionId)
    .eq("user_id", userId)) as any;

  return !error;
}

/**
 * Vote on a discussion (upvote/downvote).
 */
export async function voteDiscussion(
  discussionId: string,
  userId: string,
  voteType: "upvote" | "downvote",
): Promise<boolean> {
  const supabase = createAdminClient();

  // Remove existing vote if any
  (await (supabase
    .from("discussion_votes") as any)
    .delete()
    .eq("discussion_id", discussionId)
    .eq("user_id", userId));

  // Insert new vote
  const { error } = (await (supabase.from("discussion_votes") as any).insert({
    discussion_id: discussionId,
    user_id: userId,
    vote_type: voteType,
  })) as any;

  return !error;
}
