import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { withLogging } from "@/lib/api-helpers";

/** Strip PostgREST filter metacharacters to prevent filter injection */
function sanitizeFilterValue(value: string): string {
  return value.replace(/[,()\\]/g, "");
}

/**
 * GET /api/jobs?skills=linux,docker&location=remote&type=full_time&page=1&limit=20
 *
 * Public job search API. No authentication required.
 * Only shows active, non-expired postings.
 */
export const GET = withLogging(async (request: Request) => {
  const url = new URL(request.url);
  const skills = url.searchParams.get("skills")?.split(",").filter(Boolean);
  const location = url.searchParams.get("location");
  const isRemote = url.searchParams.get("remote");
  const employmentType = url.searchParams.get("type");
  const search = url.searchParams.get("q");
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number(url.searchParams.get("limit")) || 20),
  );
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  let query = supabase
    .from("job_postings")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .is("deleted_at", null);

  // Filter expired jobs
  query = query.or(
    `expires_at.is.null,expires_at.gt.${new Date().toISOString()}`,
  );

  if (search) {
    const s = sanitizeFilterValue(search);
    query = query.or(
      `title.ilike.%${s}%,company_name.ilike.%${s}%,description.ilike.%${s}%`,
    );
  }

  if (isRemote === "true") {
    query = query.eq("is_remote", true);
  }

  if (employmentType) {
    query = query.eq("employment_type", employmentType);
  }

  if (location) {
    const loc = sanitizeFilterValue(location);
    query = query.or(
      `location_city.ilike.%${loc}%,location_country.ilike.%${loc}%`,
    );
  }

  if (skills && skills.length > 0) {
    query = query.overlaps("required_skills", skills);
  }

  query = query
    .order("posted_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, count } = await query;

  return NextResponse.json(
    {
      jobs: data ?? [],
      total: count ?? 0,
      page,
      limit,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
      },
    },
  );
});
