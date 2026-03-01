import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Team Dashboard",
  description: "Manage your team and track progress",
};

interface TeamMember {
  id: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
  lessonsCompleted: number;
  joinedAt: string;
}

interface TeamStats {
  totalMembers: number;
  activeMembersThisWeek: number;
  totalLessonsCompleted: number;
  averageProgress: number;
  topModule: string | null;
}

function getLevelTitle(level: number): string {
  const titles: Record<number, string> = {
    1: "Newcomer",
    2: "Explorer",
    3: "Apprentice",
    4: "Practitioner",
    5: "Builder",
    6: "Specialist",
    7: "Expert",
    8: "Architect",
    9: "Principal",
    10: "Distinguished",
  };
  return titles[level] || "Newcomer";
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function MemberRow({ member }: { member: TeamMember }) {
  const initials = (member.displayName || member.username || "?")
    .slice(0, 2)
    .toUpperCase();

  return (
    <tr className="border-b last:border-0">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt=""
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {initials}
            </div>
          )}
          <div>
            <div className="font-medium">
              {member.displayName || member.username || "Anonymous"}
            </div>
            {member.username && (
              <div className="text-xs text-muted-foreground">
                @{member.username}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <Badge variant="secondary">
          Lv.{member.level} {getLevelTitle(member.level)}
        </Badge>
      </td>
      <td className="py-3 px-4 text-right">{member.totalXp.toLocaleString()}</td>
      <td className="py-3 px-4 text-right">{member.lessonsCompleted}</td>
      <td className="py-3 px-4 text-right text-sm text-muted-foreground">
        {new Date(member.joinedAt).toLocaleDateString()}
      </td>
    </tr>
  );
}

async function getTeamData(): Promise<{
  members: TeamMember[];
  stats: TeamStats;
} | null> {
  // In production, this would use the API route with auth
  // For server component, return null to show the client-fetched version
  return null;
}

export default async function TeamDashboardPage() {
  const data = await getTeamData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Team Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Monitor your team&apos;s learning progress and engagement.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Team Members"
          value={data?.stats.totalMembers ?? "—"}
        />
        <StatCard
          label="Active This Week"
          value={data?.stats.activeMembersThisWeek ?? "—"}
        />
        <StatCard
          label="Lessons Completed"
          value={data?.stats.totalLessonsCompleted ?? "—"}
        />
        <StatCard
          label="Avg. Lessons/Member"
          value={data?.stats.averageProgress ?? "—"}
        />
      </div>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {data && data.members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="py-2 px-4 font-medium">Member</th>
                    <th className="py-2 px-4 font-medium">Level</th>
                    <th className="py-2 px-4 text-right font-medium">XP</th>
                    <th className="py-2 px-4 text-right font-medium">Lessons</th>
                    <th className="py-2 px-4 text-right font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {data.members.map((member) => (
                    <MemberRow key={member.id} member={member} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-lg font-medium">No team data available</p>
              <p className="mt-1 text-sm">
                Team dashboard data will appear once your team subscription is
                active and members have joined.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Invite Members</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Share your team invite link to add new members to your plan.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Billing & Seats</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your subscription, add seats, or update payment details.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Learning Paths</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Assign learning paths to team members and track completion.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
