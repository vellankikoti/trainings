import { createAdminClient } from "@/lib/supabase/server";

interface UserRow {
  id: string;
  clerk_id: string;
  display_name: string | null;
  username: string | null;
  total_xp: number;
  current_streak: number;
  public_profile: boolean;
  created_at: string;
}

async function getUsers(): Promise<UserRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, clerk_id, display_name, username, total_xp, current_streak, public_profile, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return [];
    return (data || []) as UserRow[];
  } catch {
    return [];
  }
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold">Users</h1>
      <p className="mt-2 text-muted-foreground">
        {users.length > 0
          ? `${users.length} registered users`
          : "Connect Supabase to see user data"}
      </p>

      {users.length === 0 ? (
        <div className="mt-8 rounded-lg border bg-muted/50 p-8 text-center">
          <h2 className="text-xl font-semibold">No Users Found</h2>
          <p className="mt-2 text-muted-foreground">
            Users will appear here once Supabase is connected and users sign up.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Username</th>
                <th className="px-4 py-3 text-right font-medium">XP</th>
                <th className="px-4 py-3 text-right font-medium">Streak</th>
                <th className="px-4 py-3 text-center font-medium">Public</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{user.display_name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.username || "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {user.total_xp.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">{user.current_streak}</td>
                  <td className="px-4 py-3 text-center">
                    {user.public_profile ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
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
