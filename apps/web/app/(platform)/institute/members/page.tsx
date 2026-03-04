import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole, AuthError } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { MemberManagement } from "@/components/MemberManagement";
import { InviteMemberDialog } from "@/components/InviteMemberDialog";
import { BulkInviteDialog } from "@/components/BulkInviteDialog";

export const metadata = {
  title: "Institute Members",
  description: "Manage institute team members.",
};

export default async function InstituteMembersPage() {
  let ctx;
  try {
    ctx = await requireRole("institute_admin", "admin", "super_admin");
  } catch (e) {
    if (e instanceof AuthError) redirect("/institute");
    throw e;
  }

  if (!ctx.instituteId) redirect("/institute");

  const supabase = createAdminClient();

  const [{ data: institute }, { data: rawMembers }] = await Promise.all([
    supabase
      .from("institutes")
      .select("id, name")
      .eq("id", ctx.instituteId)
      .is("deleted_at", null)
      .single(),
    supabase
      .from("institute_members")
      .select(
        "id, role, joined_at, user_id, profiles!institute_members_user_id_fkey(id, display_name, username, avatar_url)"
      )
      .eq("institute_id", ctx.instituteId)
      .is("deleted_at", null)
      .order("joined_at", { ascending: true }),
  ]);

  if (!institute) redirect("/institute");

  const members = (rawMembers ?? []).map((m) => {
    const profile = m.profiles as unknown as {
      id: string;
      display_name: string | null;
      username: string | null;
      avatar_url: string | null;
    } | null;
    return {
      id: m.id,
      userId: m.user_id,
      role: m.role,
      joinedAt: m.joined_at,
      displayName: profile?.display_name ?? null,
      username: profile?.username ?? null,
      avatarUrl: profile?.avatar_url ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/institute"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; {institute.name}
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Members</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <BulkInviteDialog
            entityType="institute"
            entityId={ctx.instituteId}
            allowedRoles={[
              { value: "trainer", label: "Trainer" },
              { value: "institute_admin", label: "Admin" },
            ]}
          />
          <InviteMemberDialog
            entityType="institute"
            entityId={ctx.instituteId}
            allowedRoles={[
              { value: "trainer", label: "Trainer" },
              { value: "institute_admin", label: "Admin" },
            ]}
          />
        </div>
      </div>

      <MemberManagement
        entityType="institute"
        entityId={ctx.instituteId}
        members={members}
        currentUserId={ctx.profileId}
        allowedRoles={[
          { value: "trainer", label: "Trainer" },
          { value: "institute_admin", label: "Admin" },
        ]}
        adminRole="institute_admin"
      />
    </div>
  );
}
