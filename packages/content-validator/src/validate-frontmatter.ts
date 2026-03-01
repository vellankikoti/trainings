import matter from "gray-matter";

export interface ValidationError {
  file: string;
  line?: number;
  message: string;
  severity: "error" | "warning";
}

const REQUIRED_FRONTMATTER_FIELDS = [
  "title",
  "description",
  "order",
];

const OPTIONAL_FRONTMATTER_FIELDS = [
  "xpReward",
  "estimatedMinutes",
  "prerequisites",
  "objectives",
  "tags",
];

export function validateFrontmatter(
  filePath: string,
  content: string,
): ValidationError[] {
  const errors: ValidationError[] = [];

  let data: Record<string, unknown>;
  try {
    const parsed = matter(content);
    data = parsed.data;
  } catch (e) {
    errors.push({
      file: filePath,
      line: 1,
      message: `Invalid frontmatter: ${e instanceof Error ? e.message : String(e)}`,
      severity: "error",
    });
    return errors;
  }

  // Check required fields
  for (const field of REQUIRED_FRONTMATTER_FIELDS) {
    if (!(field in data) || data[field] === null || data[field] === undefined) {
      errors.push({
        file: filePath,
        line: 1,
        message: `Missing required frontmatter field: "${field}"`,
        severity: "error",
      });
    }
  }

  // Validate field types
  if (data.title && typeof data.title !== "string") {
    errors.push({
      file: filePath,
      line: 1,
      message: `Frontmatter "title" must be a string`,
      severity: "error",
    });
  }

  if (data.description && typeof data.description !== "string") {
    errors.push({
      file: filePath,
      line: 1,
      message: `Frontmatter "description" must be a string`,
      severity: "error",
    });
  }

  if (data.order !== undefined && typeof data.order !== "number") {
    errors.push({
      file: filePath,
      line: 1,
      message: `Frontmatter "order" must be a number`,
      severity: "error",
    });
  }

  if (data.xpReward !== undefined && typeof data.xpReward !== "number") {
    errors.push({
      file: filePath,
      line: 1,
      message: `Frontmatter "xpReward" must be a number`,
      severity: "error",
    });
  }

  if (data.estimatedMinutes !== undefined && typeof data.estimatedMinutes !== "number") {
    errors.push({
      file: filePath,
      line: 1,
      message: `Frontmatter "estimatedMinutes" must be a number`,
      severity: "error",
    });
  }

  if (data.objectives !== undefined && !Array.isArray(data.objectives)) {
    errors.push({
      file: filePath,
      line: 1,
      message: `Frontmatter "objectives" must be an array`,
      severity: "error",
    });
  }

  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    errors.push({
      file: filePath,
      line: 1,
      message: `Frontmatter "tags" must be an array`,
      severity: "error",
    });
  }

  // Warnings for missing recommended fields
  if (!data.objectives || (Array.isArray(data.objectives) && data.objectives.length === 0)) {
    errors.push({
      file: filePath,
      line: 1,
      message: `Missing "objectives" — lessons should have learning objectives`,
      severity: "warning",
    });
  }

  if (!data.estimatedMinutes) {
    errors.push({
      file: filePath,
      line: 1,
      message: `Missing "estimatedMinutes" — helps learners plan their time`,
      severity: "warning",
    });
  }

  return errors;
}
