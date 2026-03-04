import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getSidebarItemsForRole } from "@/lib/nav-config";
import { Sidebar } from "./Sidebar";
import type { Role } from "@/lib/auth/rbac";

/**
 * Server component that resolves the user's role and passes
 * the appropriate sidebar items to the client Sidebar.
 */
export async function SidebarWrapper() {
  let role: Role = "learner";
  let items = getSidebarItemsForRole(role);

  try {
    const { userId } = await auth();
    if (userId) {
      const supabase = createAdminClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("clerk_id", userId)
        .maybeSingle();

      role = (profile?.role ?? "learner") as Role;
      items = getSidebarItemsForRole(role);
    }
  } catch {
    // Fall back to learner items
  }

  return <Sidebar items={items} role={role} />;
}
