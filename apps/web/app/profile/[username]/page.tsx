import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/profile";
import { calculateLevel, levelProgress, xpToNextLevel } from "@/lib/levels";

interface ProfilePageProps {
  params: { username: string };
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const profile = await getPublicProfile(params.username);
  if (!profile)
    return { title: "Profile Not Found" };

  return {
    title: `${profile.display_name || params.username} — Profile`,
    description: `${profile.display_name || params.username}'s profile on DEVOPS ENGINEERS.`,
  };
}

export default async function PublicProfilePage({
  params,
}: ProfilePageProps) {
  const profile = await getPublicProfile(params.username);
  if (!profile) notFound();

  const totalXP = (profile as any).total_xp ?? 0;
  const level = calculateLevel(totalXP);
  const progress = levelProgress(totalXP);
  const xpNeeded = xpToNextLevel(totalXP);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      {/* Profile Header */}
      <div className="flex items-start gap-6">
        {(profile as any).avatar_url ? (
          <img
            src={(profile as any).avatar_url}
            alt=""
            className="h-20 w-20 rounded-full"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {(profile.display_name || params.username).charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold">
            {profile.display_name || params.username}
          </h1>
          <p className="text-muted-foreground">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-2 text-muted-foreground">{profile.bio}</p>
          )}
          {(profile as any).github_username && (
            <p className="mt-1 text-sm text-muted-foreground">
              GitHub: {(profile as any).github_username}
            </p>
          )}
        </div>
      </div>

      {/* Level Card */}
      <div className="mt-8 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Level {level.level}</div>
            <div className="text-xl font-bold">{level.title}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{totalXP} XP</div>
            {xpNeeded > 0 && (
              <div className="text-sm text-muted-foreground">
                {xpNeeded} XP to next level
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Member since */}
      <div className="mt-6 text-sm text-muted-foreground">
        Member since{" "}
        {new Date((profile as any).created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        })}
      </div>
    </div>
  );
}
