import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface SearchItem {
  title: string;
  description: string;
  href: string;
  type: "path" | "module" | "lesson" | "blog";
  tags?: string[];
}

const CONTENT_ROOT = path.join(process.cwd(), "..", "..", "content");
const PATHS_DIR = path.join(CONTENT_ROOT, "paths");
const BLOG_DIR = path.join(CONTENT_ROOT, "blog");

/**
 * Build the full search index from the content directory.
 * Called at build-time via the API route to generate a static JSON index.
 */
export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  // Index learning paths
  if (fs.existsSync(PATHS_DIR)) {
    const pathDirs = fs.readdirSync(PATHS_DIR);

    for (const pathDir of pathDirs) {
      const pathJsonFile = path.join(PATHS_DIR, pathDir, "path.json");
      if (!fs.existsSync(pathJsonFile)) continue;

      try {
        const pathData = JSON.parse(fs.readFileSync(pathJsonFile, "utf-8"));
        items.push({
          title: pathData.title,
          description: pathData.description || "",
          href: `/paths/${pathData.slug || pathDir}`,
          type: "path",
          tags: pathData.tags || [],
        });

        // Index modules within the path
        const moduleDirs = fs.readdirSync(path.join(PATHS_DIR, pathDir));
        for (const moduleDir of moduleDirs) {
          const moduleJsonFile = path.join(PATHS_DIR, pathDir, moduleDir, "module.json");
          if (!fs.existsSync(moduleJsonFile)) continue;

          try {
            const moduleData = JSON.parse(fs.readFileSync(moduleJsonFile, "utf-8"));
            items.push({
              title: moduleData.title,
              description: moduleData.description || "",
              href: `/paths/${pathData.slug || pathDir}`,
              type: "module",
              tags: [],
            });

            // Index lessons within the module
            const lessonDirs = fs.readdirSync(path.join(PATHS_DIR, pathDir, moduleDir));
            for (const lessonDir of lessonDirs) {
              const lessonFile = path.join(PATHS_DIR, pathDir, moduleDir, lessonDir, "index.mdx");
              if (!fs.existsSync(lessonFile)) continue;

              try {
                const content = fs.readFileSync(lessonFile, "utf-8");
                const { data } = matter(content);
                items.push({
                  title: data.title || lessonDir,
                  description: data.description || "",
                  href: `/learn/${pathData.slug || pathDir}/${moduleData.slug || moduleDir}/${lessonDir}`,
                  type: "lesson",
                  tags: data.tags || [],
                });
              } catch {
                // Skip malformed lessons
              }
            }
          } catch {
            // Skip malformed modules
          }
        }
      } catch {
        // Skip malformed paths
      }
    }
  }

  // Index blog posts
  if (fs.existsSync(BLOG_DIR)) {
    const blogFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

    for (const file of blogFiles) {
      try {
        const content = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
        const { data } = matter(content);
        const slug = file.replace(/\.(mdx|md)$/, "");
        items.push({
          title: data.title || slug,
          description: data.description || "",
          href: `/blog/${slug}`,
          type: "blog",
          tags: data.tags || [],
        });
      } catch {
        // Skip malformed blog posts
      }
    }
  }

  return items;
}
