import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ValidationError } from "./validate-frontmatter.js";

/**
 * Validates internal links in MDX content point to existing content.
 */
export function validateLinks(
  filePath: string,
  content: string,
  contentRoot: string,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { content: body } = matter(content);
  const lines = body.split("\n");

  // Match markdown links: [text](/path)
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;

    while ((match = linkRegex.exec(line)) !== null) {
      const href = match[2];

      // Skip external links, anchors, and protocol links
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("#") ||
        href.startsWith("mailto:")
      ) {
        continue;
      }

      // Check if internal path exists
      if (href.startsWith("/")) {
        // Try to map to content directory
        const segments = href.split("/").filter(Boolean);

        // Internal links like /learn/foundations/linux/the-linux-story
        if (segments[0] === "learn" && segments.length >= 4) {
          const lessonPath = path.join(
            contentRoot,
            segments[1], // path slug
            segments[2], // module slug
            segments[3], // lesson slug
            "index.mdx",
          );
          const lessonPathMd = path.join(
            contentRoot,
            segments[1],
            segments[2],
            segments[3],
            "index.md",
          );

          if (!fs.existsSync(lessonPath) && !fs.existsSync(lessonPathMd)) {
            errors.push({
              file: filePath,
              line: i + 1,
              message: `Internal link "${href}" points to non-existent lesson`,
              severity: "error",
            });
          }
        }
      }
    }
  }

  return errors;
}
