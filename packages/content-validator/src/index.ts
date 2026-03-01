import fs from "fs";
import path from "path";
import { glob } from "glob";
import { validateFrontmatter, type ValidationError } from "./validate-frontmatter.js";
import { validateStructure } from "./validate-structure.js";
import { validateLinks } from "./validate-links.js";

// Resolve content root: use env var if set, otherwise go up to monorepo root
const MONOREPO_ROOT = path.resolve(
  new URL(".", import.meta.url).pathname,
  "..",
  "..",
  "..",
);
const CONTENT_ROOT = process.env.CONTENT_ROOT || path.join(MONOREPO_ROOT, "content", "paths");

async function main() {
  console.log("Validating content...\n");

  // Find all MDX/MD lesson files
  const files = await glob("**/index.{mdx,md}", { cwd: CONTENT_ROOT });

  if (files.length === 0) {
    console.log("No content files found in", CONTENT_ROOT);
    process.exit(0);
  }

  const allErrors: ValidationError[] = [];

  for (const file of files) {
    const filePath = path.join(CONTENT_ROOT, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const relativePath = path.relative(process.cwd(), filePath);

    const frontmatterErrors = validateFrontmatter(relativePath, content);
    const structureErrors = validateStructure(relativePath, content);
    const linkErrors = validateLinks(relativePath, content, CONTENT_ROOT);

    allErrors.push(...frontmatterErrors, ...structureErrors, ...linkErrors);
  }

  // Also validate path.json and module.json files
  const pathJsonFiles = await glob("**/path.json", { cwd: CONTENT_ROOT });
  for (const file of pathJsonFiles) {
    const filePath = path.join(CONTENT_ROOT, file);
    const relativePath = path.relative(process.cwd(), filePath);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(content);
      if (!data.title) {
        allErrors.push({
          file: relativePath,
          message: `Missing "title" field in path.json`,
          severity: "error",
        });
      }
      if (!data.slug) {
        allErrors.push({
          file: relativePath,
          message: `Missing "slug" field in path.json`,
          severity: "error",
        });
      }
    } catch (e) {
      allErrors.push({
        file: relativePath,
        message: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
        severity: "error",
      });
    }
  }

  const moduleJsonFiles = await glob("**/module.json", { cwd: CONTENT_ROOT });
  for (const file of moduleJsonFiles) {
    const filePath = path.join(CONTENT_ROOT, file);
    const relativePath = path.relative(process.cwd(), filePath);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(content);
      if (!data.title) {
        allErrors.push({
          file: relativePath,
          message: `Missing "title" field in module.json`,
          severity: "error",
        });
      }
      if (!data.slug) {
        allErrors.push({
          file: relativePath,
          message: `Missing "slug" field in module.json`,
          severity: "error",
        });
      }
    } catch (e) {
      allErrors.push({
        file: relativePath,
        message: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
        severity: "error",
      });
    }
  }

  // Report results
  const errors = allErrors.filter((e) => e.severity === "error");
  const warnings = allErrors.filter((e) => e.severity === "warning");

  if (errors.length > 0) {
    console.log(`ERRORS (${errors.length}):\n`);
    for (const err of errors) {
      const loc = err.line ? `:${err.line}` : "";
      console.log(`  ✗ ${err.file}${loc}`);
      console.log(`    ${err.message}\n`);
    }
  }

  if (warnings.length > 0) {
    console.log(`WARNINGS (${warnings.length}):\n`);
    for (const warn of warnings) {
      const loc = warn.line ? `:${warn.line}` : "";
      console.log(`  ⚠ ${warn.file}${loc}`);
      console.log(`    ${warn.message}\n`);
    }
  }

  console.log(
    `\nValidated ${files.length} lesson(s), ${pathJsonFiles.length} path(s), ${moduleJsonFiles.length} module(s)`,
  );
  console.log(
    `Results: ${errors.length} error(s), ${warnings.length} warning(s)`,
  );

  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Validation failed:", err);
  process.exit(1);
});
