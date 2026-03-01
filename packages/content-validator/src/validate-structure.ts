import matter from "gray-matter";
import type { ValidationError } from "./validate-frontmatter.js";

/**
 * Validates the content structure of an MDX lesson.
 */
export function validateStructure(
  filePath: string,
  content: string,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { content: body } = matter(content);
  const lines = body.split("\n");

  // Check that all code blocks have language identifiers
  let inCodeBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        // Opening code fence — check for language
        const lang = line.slice(3).trim();
        if (!lang) {
          errors.push({
            file: filePath,
            line: i + 1,
            message: `Code block missing language identifier (e.g., \`\`\`bash, \`\`\`typescript)`,
            severity: "warning",
          });
        }
        inCodeBlock = true;
      } else {
        inCodeBlock = false;
      }
    }
  }

  // Check for at least one heading (h2)
  const hasH2 = lines.some((line) => /^## /.test(line));
  if (!hasH2) {
    errors.push({
      file: filePath,
      message: `Lesson has no h2 (##) headings — lessons should have section headings`,
      severity: "warning",
    });
  }

  // Check for recommended sections
  const hasCallout = body.includes("<Callout");
  if (!hasCallout) {
    errors.push({
      file: filePath,
      message: `No <Callout> components found — consider adding story, tip, or info callouts`,
      severity: "warning",
    });
  }

  const hasExercise = body.includes("<Exercise");
  if (!hasExercise) {
    errors.push({
      file: filePath,
      message: `No <Exercise> components found — lessons should have hands-on exercises`,
      severity: "warning",
    });
  }

  return errors;
}
