import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";
import { candidateInteractionSchema, validateBody } from "@/lib/validations";

type Params = { params: Promise<{ orgId: string }> };

/**
 * GET /api/organizations/[orgId]/interactions?type=shortlisted
 * POST /api/organizations/[orgId]/interactions — Log a candidate interaction
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { orgId } = await params;
    const ctx = await requireRole(
      "recruiter",
      "org_admin",
      "admin",
      "super_admin",
    );

    if (
      ctx.role !== "admin" &&
      ctx.role !== "super_admin" &&
      ctx.orgId !== orgId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    const supabase = createAdminClient();
    let query = supabase
      .from("candidate_interactions")
      .select(
        "id, interaction_type, notes, created_at, profiles!candidate_interactions_candidate_id_fkey(id, display_name, username, avatar_url)",
      )
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (type) {
      query = query.eq("interaction_type", type);
    }

    const { data } = await query;
    return NextResponse.json(data ?? []);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { orgId } = await params;
    const ctx = await requireRole(
      "recruiter",
      "org_admin",
      "admin",
      "super_admin",
    );

    if (
      ctx.role !== "admin" &&
      ctx.role !== "super_admin" &&
      ctx.orgId !== orgId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validated = validateBody(candidateInteractionSchema, body);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const supabase = createAdminClient();

    // For profile_viewed, decrement org's remaining views
    if (validated.data.interaction_type === "profile_viewed") {
      const { data: org } = await supabase
        .from("organizations")
        .select("profile_views_remaining")
        .eq("id", orgId)
        .single();

      if (org && org.profile_views_remaining <= 0) {
        return NextResponse.json(
          { error: "Profile view limit reached. Upgrade your plan." },
          { status: 403 },
        );
      }

      await supabase
        .from("organizations")
        .update({
          profile_views_remaining: (org?.profile_views_remaining ?? 1) - 1,
        })
        .eq("id", orgId);
    }

    // For contacted, decrement remaining contacts
    if (validated.data.interaction_type === "contacted") {
      const { data: org } = await supabase
        .from("organizations")
        .select("contacts_remaining")
        .eq("id", orgId)
        .single();

      if (org && org.contacts_remaining <= 0) {
        return NextResponse.json(
          { error: "Contact limit reached. Upgrade your plan." },
          { status: 403 },
        );
      }

      await supabase
        .from("organizations")
        .update({
          contacts_remaining: (org?.contacts_remaining ?? 1) - 1,
        })
        .eq("id", orgId);
    }

    const { data, error } = await supabase
      .from("candidate_interactions")
      .insert({
        org_id: orgId,
        recruiter_id: ctx.profileId,
        candidate_id: validated.data.candidate_id,
        interaction_type: validated.data.interaction_type,
        notes: validated.data.notes,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to log interaction" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
