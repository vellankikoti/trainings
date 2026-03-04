import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";

/**
 * GET /api/admin/approvals — List pending entity registrations for admin review.
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole("admin", "super_admin");
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // organization | institute | all
    const status = searchParams.get("status") || "pending_review";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    let query = supabase
      .from("approval_requests")
      .select("*, profiles!approval_requests_requested_by_fkey(id, display_name, username, avatar_url)", { count: "exact" })
      .eq("status", status)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (type !== "all") {
      query = query.eq("entity_type", type);
    }

    const { data: approvals, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch approvals" }, { status: 500 });
    }

    // Enrich with entity names
    const enriched = await Promise.all(
      (approvals ?? []).map(async (approval) => {
        const entityTable = approval.entity_type === "organization" ? "organizations" : "institutes";
        const { data: entity } = await supabase
          .from(entityTable)
          .select("name, slug, description, website")
          .eq("id", approval.entity_id)
          .single();

        const profile = approval.profiles as unknown as {
          id: string;
          display_name: string | null;
          username: string | null;
          avatar_url: string | null;
        } | null;

        return {
          id: approval.id,
          entity_type: approval.entity_type,
          entity_id: approval.entity_id,
          entity_name: (entity as Record<string, unknown>)?.name,
          entity_slug: (entity as Record<string, unknown>)?.slug,
          entity_description: (entity as Record<string, unknown>)?.description,
          entity_website: (entity as Record<string, unknown>)?.website,
          status: approval.status,
          requested_by: {
            id: profile?.id,
            name: profile?.display_name || profile?.username,
            avatar_url: profile?.avatar_url,
          },
          escalated: approval.escalated,
          created_at: approval.created_at,
        };
      })
    );

    return NextResponse.json({
      data: {
        items: enriched,
        total: count ?? 0,
        page,
        limit,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
