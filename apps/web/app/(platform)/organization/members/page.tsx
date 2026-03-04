import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole, AuthError } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { MemberManagement } from "@/components/MemberManagement";
import { InviteMemberDialog } from "@/components/InviteMemberDialog";
import { BulkInviteDialog } from "@/components/BulkInviteDialog";

export const metadata = {
  title: "Organization Members",
  description: "Manage organization team members.",
};

export default async function OrgMembersPage() {
  let ctx;
  try {
    ctx = await requireRole("org_admin", "admin", "super_admin");
  } catch (e) {
    if (e instanceof AuthError) redirect("/organization");
    throw e;
  }

  if (!ctx.orgId) redirect("/organization");

  const supabase = createAdminClient();

  const [{ data: org }, { data: rawMembers }] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name")
      .eq("id", ctx.orgId)
      .is("deleted_at", null)
      .single(),
    supabase
      .from("org_members")
      .select(
        "id, role, joined_at, user_id, profiles!org_members_user_id_fkey(id, display_name, username, avatar_url)"
      )
      .eq("org_id", ctx.orgId)
      .is("deleted_at", null)
      .order("joined_at", { ascending: true }),
  ]);

  if (!org) redirect("/organization");

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
            href="/organization"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; {org.name}
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Members</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <BulkInviteDialog
            entityType="organization"
            entityId={ctx.orgId}
            allowedRoles={[
              { value: "recruiter", label: "Recruiter" },
              { value: "org_admin", label: "Admin" },
            ]}
          />
          <InviteMemberDialog
            entityType="organization"
            entityId={ctx.orgId}
            allowedRoles={[
              { value: "recruiter", label: "Recruiter" },
              { value: "org_admin", label: "Admin" },
            ]}
          />
        </div>
      </div>

      <MemberManagement
        entityType="organization"
        entityId={ctx.orgId}
        members={members}
        currentUserId={ctx.profileId}
        allowedRoles={[
          { value: "recruiter", label: "Recruiter" },
          { value: "org_admin", label: "Admin" },
        ]}
        adminRole="org_admin"
      />
    </div>
  );
}
