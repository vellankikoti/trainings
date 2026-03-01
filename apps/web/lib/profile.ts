import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const EDITABLE_FIELDS: (keyof ProfileUpdate)[] = [
  "display_name",
  "username",
  "bio",
  "github_username",
  "experience_level",
  "weekly_hours",
  "primary_goal",
  "recommended_path",
  "theme",
  "email_notifications",
  "public_profile",
];

export async function getProfileByClerkId(
  clerkId: string,
): Promise<Profile | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getPublicProfile(
  username: string,
): Promise<Partial<Profile> | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "username, display_name, avatar_url, bio, github_username, current_level, total_xp, public_profile, created_at",
    )
    .eq("username", username)
    .eq("public_profile", true)
    .single();

  if (error || !data) return null;
  return data;
}

export async function updateProfile(
  clerkId: string,
  updates: Record<string, unknown>,
): Promise<Profile | null> {
  // Filter to only allow editable fields
  const safeUpdates: Record<string, unknown> = {};
  for (const key of EDITABLE_FIELDS) {
    if (key in updates) {
      safeUpdates[key] = updates[key];
    }
  }

  if (Object.keys(safeUpdates).length === 0) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(safeUpdates as ProfileUpdate)
    .eq("clerk_id", clerkId)
    .select()
    .single();

  if (error || !data) return null;
  return data;
}
