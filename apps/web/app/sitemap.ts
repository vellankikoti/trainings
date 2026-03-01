import type { MetadataRoute } from "next";
import { getAllPaths, getModulesForPath } from "@/lib/content";
import { getLessonSlugs } from "@/lib/mdx";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://devopsengineer.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = getAllPaths();
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  entries.push(
    { url: BASE_URL, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/paths`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
  );

  // Path pages
  for (const p of paths) {
    entries.push({
      url: `${BASE_URL}/paths/${p.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    });

    // Module lesson pages
    const modules = getModulesForPath(p.slug);
    for (const mod of modules) {
      const lessonSlugs = getLessonSlugs(p.slug, mod.slug);
      for (const lessonSlug of lessonSlugs) {
        entries.push({
          url: `${BASE_URL}/learn/${p.slug}/${mod.slug}/${lessonSlug}`,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  }

  return entries;
}
