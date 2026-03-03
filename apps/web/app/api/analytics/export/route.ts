import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/progress";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/analytics/export?type=progress|events|skills
 *
 * Export user analytics data as CSV.
 * Supports three export types:
 *   - progress: Lesson/module/path completion data
 *   - events: User activity events
 *   - skills: Skill scores per domain
 */
export async function GET(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const exportType = url.searchParams.get("type") ?? "progress";

  const supabase = createAdminClient();

  try {
    let csv: string;
    let filename: string;

    switch (exportType) {
      case "progress": {
        const { data } = await supabase
          .from("lesson_progress")
          .select(
            "path_slug, module_slug, lesson_slug, status, started_at, completed_at, time_spent_seconds, xp_earned",
          )
          .eq("user_id", profileId)
          .order("started_at", { ascending: true });

        csv = toCsv(data ?? [], [
          "path_slug",
          "module_slug",
          "lesson_slug",
          "status",
          "started_at",
          "completed_at",
          "time_spent_seconds",
          "xp_earned",
        ]);
        filename = "progress-export.csv";
        break;
      }

      case "events": {
        const { data } = await supabase
          .from("events")
          .select("event_type, data, session_id, created_at")
          .eq("user_id", profileId)
          .order("created_at", { ascending: false })
          .limit(5000);

        csv = toCsv(
          (data ?? []).map((e) => ({
            event_type: e.event_type,
            data: JSON.stringify(e.data),
            session_id: e.session_id,
            created_at: e.created_at,
          })),
          ["event_type", "data", "session_id", "created_at"],
        );
        filename = "events-export.csv";
        break;
      }

      case "skills": {
        const { data } = await supabase
          .from("skill_scores")
          .select(
            "domain, composite_score, theory_score, lab_score, quiz_score, percentile, calculated_at",
          )
          .eq("user_id", profileId)
          .order("composite_score", { ascending: false });

        csv = toCsv(data ?? [], [
          "domain",
          "composite_score",
          "theory_score",
          "lab_score",
          "quiz_score",
          "percentile",
          "calculated_at",
        ]);
        filename = "skills-export.csv";
        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid export type. Use: progress, events, or skills" },
          { status: 400 },
        );
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 },
    );
  }
}

/**
 * Convert array of objects to CSV string.
 */
function toCsv(
  rows: Record<string, unknown>[],
  columns: string[],
): string {
  if (rows.length === 0) {
    return columns.join(",") + "\n";
  }

  const header = columns.join(",");
  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const val = row[col];
          if (val === null || val === undefined) return "";
          const str = String(val);
          // Escape CSV special characters
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(","),
    )
    .join("\n");

  return header + "\n" + body + "\n";
}
