import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const results: Record<string, unknown> = {
    cwd: process.cwd(),
    nodeVersion: process.version,
  };

  // Check content directory resolution
  const contentDir = path.join(process.cwd(), "..", "..", "content", "paths");
  results.contentDir = contentDir;
  results.contentDirExists = fs.existsSync(contentDir);

  // Try alternative paths
  const altPaths = [
    path.join(process.cwd(), "content", "paths"),
    path.join(process.cwd(), "..", "content", "paths"),
    path.join(process.cwd(), "..", "..", "content", "paths"),
    path.join(process.cwd(), "..", "..", "..", "content", "paths"),
  ];

  results.pathChecks = altPaths.map((p) => ({
    path: p,
    exists: fs.existsSync(p),
  }));

  // If content dir exists, try reading a lesson
  if (results.contentDirExists) {
    const lessonPath = path.join(
      contentDir,
      "foundations",
      "linux",
      "01-the-linux-story",
      "index.mdx",
    );
    results.lessonPath = lessonPath;
    results.lessonExists = fs.existsSync(lessonPath);

    if (results.lessonExists) {
      try {
        const raw = fs.readFileSync(lessonPath, "utf-8");
        results.lessonSize = raw.length;
        results.lessonPreview = raw.substring(0, 200);
      } catch (e: any) {
        results.readError = e.message;
      }

      // Try MDX serialization
      try {
        const { getLesson } = await import("@/lib/mdx");
        const lesson = await getLesson("foundations", "linux", "01-the-linux-story");
        results.mdxSuccess = !!lesson;
        results.mdxTitle = lesson?.frontmatter?.title;
      } catch (e: any) {
        results.mdxError = e.message;
        results.mdxStack = e.stack?.split("\n").slice(0, 5);
      }
    }
  }

  // List what's in cwd
  try {
    results.cwdContents = fs.readdirSync(process.cwd());
  } catch (e: any) {
    results.cwdError = e.message;
  }

  // List parent dirs
  try {
    results.parentContents = fs.readdirSync(path.join(process.cwd(), ".."));
  } catch (e: any) {
    results.parentError = e.message;
  }

  try {
    results.grandparentContents = fs.readdirSync(
      path.join(process.cwd(), "..", ".."),
    );
  } catch (e: any) {
    results.grandparentError = e.message;
  }

  return NextResponse.json(results, { status: 200 });
}
