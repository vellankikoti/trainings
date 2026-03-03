/**
 * In-App Notification Service
 *
 * Creates, retrieves, and manages notifications for users.
 * Notifications are created by the system after significant events
 * (badge earned, level up, streak milestones, etc.)
 */

import { createAdminClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

// ── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | "badge_earned"
  | "level_up"
  | "streak_milestone"
  | "streak_warning"
  | "course_complete"
  | "path_complete"
  | "lab_result"
  | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

interface CreateNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

// ── Create ───────────────────────────────────────────────────────────────────

/**
 * Create a notification for a user.
 */
export async function createNotification(
  opts: CreateNotificationOptions,
): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("notifications").insert({
    user_id: opts.userId,
    type: opts.type,
    title: opts.title,
    message: opts.message,
    data: (opts.data ?? {}) as Json,
  });
}

// ── Read ─────────────────────────────────────────────────────────────────────

/**
 * Get recent notifications for a user.
 */
export async function getNotifications(
  userId: string,
  limit = 20,
): Promise<Notification[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((n) => ({
    id: n.id,
    userId: n.user_id,
    type: n.type as NotificationType,
    title: n.title,
    message: n.message,
    data: (n.data ?? {}) as Record<string, unknown>,
    read: n.read,
    createdAt: n.created_at,
  }));
}

/**
 * Get count of unread notifications.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  return count ?? 0;
}

// ── Update ───────────────────────────────────────────────────────────────────

/**
 * Mark a single notification as read.
 */
export async function markAsRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllAsRead(userId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
}
