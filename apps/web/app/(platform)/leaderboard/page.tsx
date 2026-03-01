import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { calculateLevel } from "@/lib/levels";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "See the top learners on DEVOPS ENGINEERS.",
};

export default async function LeaderboardPage() {
  let topLearners: Array<{
    id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
    total_xp: number;
    current_streak: number;
    rank: number;
    level: ReturnType<typeof calculateLevel>;
  }> = [];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createAdminClient();
    const { data: leaders } = await supabase
      .from("profiles")
      .select(
        "id, display_name, username, avatar_url, total_xp, current_level, current_streak, public_profile",
      )
      .eq("public_profile", true)
      .order("total_xp", { ascending: false })
      .limit(50);

    topLearners = (leaders ?? []).map((leader, index) => ({
      ...leader,
      rank: index + 1,
      level: calculateLevel(leader.total_xp),
    }));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Leaderboard</h1>

      {topLearners.length === 0 ? (
        <div className="rounded-lg border bg-muted/50 p-8 text-center">
          <p className="text-muted-foreground">
            No public profiles yet. Be the first!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b text-sm text-muted-foreground">
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">Learner</th>
                <th className="px-4 py-3 text-left">Level</th>
                <th className="px-4 py-3 text-right">XP</th>
                <th className="px-4 py-3 text-right">Streak</th>
              </tr>
            </thead>
            <tbody>
              {topLearners.map((leader) => (
                <tr key={leader.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        leader.rank <= 3
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {leader.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {leader.avatar_url ? (
                        <img
                          src={leader.avatar_url}
                          alt=""
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {(leader.display_name || leader.username || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {leader.display_name || leader.username}
                        </div>
                        {leader.username && (
                          <div className="text-xs text-muted-foreground">
                            @{leader.username}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {leader.level.title}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm">
                    {leader.total_xp.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    {leader.current_streak > 0 && `${leader.current_streak}d`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
