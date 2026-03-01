import { headers } from "next/headers";
import { Webhook } from "svix";
import { createAdminClient } from "@/lib/supabase/server";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    external_accounts: Array<{
      provider: string;
      username: string | null;
    }>;
    username: string | null;
  };
};

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let event: ClerkWebhookEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkWebhookEvent;
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "user.created": {
      const { id, first_name, last_name, image_url, external_accounts, username } =
        event.data;

      const displayName = [first_name, last_name].filter(Boolean).join(" ") || null;
      const githubAccount = external_accounts?.find(
        (acc) => acc.provider === "oauth_github",
      );

      const { error } = await supabase.from("profiles").insert({
        clerk_id: id,
        display_name: displayName,
        avatar_url: image_url,
        username: username,
        github_username: githubAccount?.username || null,
      });

      if (error) {
        console.error("Failed to create profile:", error);
        return new Response("Failed to create profile", { status: 500 });
      }

      return new Response("Profile created", { status: 200 });
    }

    case "user.updated": {
      const { id, first_name, last_name, image_url, external_accounts, username } =
        event.data;

      const displayName = [first_name, last_name].filter(Boolean).join(" ") || null;
      const githubAccount = external_accounts?.find(
        (acc) => acc.provider === "oauth_github",
      );

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          avatar_url: image_url,
          username: username,
          github_username: githubAccount?.username || null,
        })
        .eq("clerk_id", id);

      if (error) {
        console.error("Failed to update profile:", error);
        return new Response("Failed to update profile", { status: 500 });
      }

      return new Response("Profile updated", { status: 200 });
    }

    case "user.deleted": {
      const { id } = event.data;

      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("clerk_id", id);

      if (error) {
        console.error("Failed to delete profile:", error);
        return new Response("Failed to delete profile", { status: 500 });
      }

      return new Response("Profile deleted", { status: 200 });
    }

    default:
      return new Response("Unhandled event type", { status: 200 });
  }
}
