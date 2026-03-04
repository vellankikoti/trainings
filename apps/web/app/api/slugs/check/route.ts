import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth, AuthError } from "@/lib/auth";

/**
 * GET /api/slugs/check?slug=xxx&type=organization|institute
 *
 * Real-time slug availability check for registration forms.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const type = searchParams.get("type");

    if (!slug || !type) {
      return NextResponse.json(
        { error: "slug and type are required" },
        { status: 400 }
      );
    }

    if (type !== "organization" && type !== "institute") {
      return NextResponse.json(
        { error: "type must be 'organization' or 'institute'" },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) || slug.length < 2 || slug.length > 50) {
      return NextResponse.json({
        data: { available: false, reason: "Invalid slug format" },
      });
    }

    // Check reserved slugs
    const RESERVED = [
      "admin", "api", "auth", "dashboard", "settings", "help",
      "support", "billing", "app", "www",
    ];
    if (RESERVED.includes(slug)) {
      return NextResponse.json({
        data: { available: false, reason: "This URL is reserved" },
      });
    }

    const supabase = createAdminClient();
    const table = type === "organization" ? "organizations" : "institutes";

    const { data: existing } = await supabase
      .from(table)
      .select("id")
      .eq("slug", slug)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      data: {
        available: !existing,
        reason: existing ? "This slug is already taken" : null,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
