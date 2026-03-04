import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth, AuthError } from "@/lib/auth";

/**
 * GET /api/me/memberships — Get current user's organization and institute memberships.
 */
export async function GET() {
  try {
    const ctx = await requireAuth();
    const supabase = createAdminClient();

    // Fetch org memberships with org details
    const { data: orgMemberships } = await supabase
      .from("org_members")
      .select(`
        id,
        role,
        joined_at,
        organizations!inner (
          id,
          name,
          slug,
          logo_url,
          status
        )
      `)
      .eq("user_id", ctx.profileId)
      .is("deleted_at", null);

    // Fetch institute memberships with institute details
    const { data: instituteMemberships } = await supabase
      .from("institute_members")
      .select(`
        id,
        role,
        joined_at,
        institutes!inner (
          id,
          name,
          slug,
          logo_url,
          status
        )
      `)
      .eq("user_id", ctx.profileId)
      .is("deleted_at", null);

    return NextResponse.json({
      data: {
        organizations: (orgMemberships ?? []).map((m: any) => ({
          membership_id: m.id,
          role: m.role,
          joined_at: m.joined_at,
          org_id: m.organizations.id,
          name: m.organizations.name,
          slug: m.organizations.slug,
          logo_url: m.organizations.logo_url,
          status: m.organizations.status,
        })),
        institutes: (instituteMemberships ?? []).map((m: any) => ({
          membership_id: m.id,
          role: m.role,
          joined_at: m.joined_at,
          institute_id: m.institutes.id,
          name: m.institutes.name,
          slug: m.institutes.slug,
          logo_url: m.institutes.logo_url,
          status: m.institutes.status,
        })),
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
