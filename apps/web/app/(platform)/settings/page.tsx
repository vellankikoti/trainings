import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProfileByClerkId } from "@/lib/profile";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { PreferencesForm } from "@/components/settings/PreferencesForm";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your profile and preferences.",
};

export default async function SettingsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const profile = await getProfileByClerkId(clerkId);
  if (!profile) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Settings</h1>

      <div className="space-y-10">
        <section>
          <h2 className="mb-4 text-xl font-semibold">Profile</h2>
          <div className="rounded-lg border p-6">
            <ProfileForm
              initialData={{
                display_name: profile.display_name,
                username: profile.username,
                bio: profile.bio,
                github_username: profile.github_username,
                public_profile: profile.public_profile,
              }}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Preferences</h2>
          <div className="rounded-lg border p-6">
            <PreferencesForm
              initialData={{
                theme: profile.theme,
                email_notifications: profile.email_notifications,
              }}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-red-600">
            Danger Zone
          </h2>
          <div className="rounded-lg border border-red-500/20 p-6">
            <p className="text-sm text-muted-foreground">
              Deleting your account will permanently remove all your progress, achievements, and certificates. This action cannot be undone.
            </p>
            <button
              className="mt-4 rounded-lg border border-red-500 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-500/10"
              disabled
            >
              Delete Account (Coming Soon)
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
