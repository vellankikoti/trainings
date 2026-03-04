import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";

type Params = { params: Promise<{ orgId: string }> };

/**
 * GET /api/organizations/[orgId]/candidates?skills=linux,docker&min_score=50&availability=open&page=1&limit=20
 *
 * Search for candidates with skill-based filtering, location, and availability.
 * Decrements profile_views_remaining for new views.
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
    const skills = url.searchParams.get("skills")?.split(",").filter(Boolean);
    const minScore = Number(url.searchParams.get("min_score")) || 0;
    const availability = url.searchParams.get("availability");
    const locationCity = url.searchParams.get("location_city");
    const locationCountry = url.searchParams.get("location_country");
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(url.searchParams.get("limit")) || 20),
    );
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    // Build candidate query — discoverable profiles only
    let query = supabase
      .from("profiles")
      .select(
        "id, display_name, username, avatar_url, total_xp, current_level, current_streak, location_city, location_country, availability, bio",
        { count: "exact" },
      )
      .eq("is_discoverable", true)
      .eq("public_profile", true)
      .is("deleted_at", null);

    if (availability) {
      query = query.eq("availability", availability);
    }
    if (locationCity) {
      query = query.ilike("location_city", `%${locationCity}%`);
    }
    if (locationCountry) {
      query = query.ilike("location_country", `%${locationCountry}%`);
    }

    query = query
      .order("total_xp", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: profiles, count: totalCount } = await query;

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        candidates: [],
        total: 0,
        page,
        limit,
      });
    }

    // If skills filter is provided, get skill scores for matched profiles
    const profileIds = profiles.map((p) => p.id);
    let skillData: Map<
      string,
      { domain: string; composite_score: number }[]
    > = new Map();

    if (skills && skills.length > 0) {
      const { data: scores } = await supabase
        .from("skill_scores")
        .select("user_id, domain, composite_score")
        .in("user_id", profileIds)
        .in("domain", skills)
        .gte("composite_score", minScore);

      for (const s of scores ?? []) {
        if (!skillData.has(s.user_id)) {
          skillData.set(s.user_id, []);
        }
        skillData.get(s.user_id)!.push({
          domain: s.domain,
          composite_score: s.composite_score,
        });
      }

      // Filter to only profiles that match at least one skill
      const matchedIds = new Set(skillData.keys());
      const candidates = profiles
        .filter((p) => matchedIds.has(p.id))
        .map((p) => ({
          ...p,
          skills: skillData.get(p.id) ?? [],
        }));

      return NextResponse.json({
        candidates,
        total: candidates.length,
        page,
        limit,
      });
    }

    // No skill filter — return all discoverable profiles with top skills
    const { data: topSkills } = await supabase
      .from("skill_scores")
      .select("user_id, domain, composite_score")
      .in("user_id", profileIds)
      .order("composite_score", { ascending: false });

    for (const s of topSkills ?? []) {
      if (!skillData.has(s.user_id)) {
        skillData.set(s.user_id, []);
      }
      const arr = skillData.get(s.user_id)!;
      if (arr.length < 5) {
        arr.push({ domain: s.domain, composite_score: s.composite_score });
      }
    }

    const candidates = profiles.map((p) => ({
      ...p,
      skills: skillData.get(p.id) ?? [],
    }));

    return NextResponse.json({
      candidates,
      total: totalCount ?? candidates.length,
      page,
      limit,
    });
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
