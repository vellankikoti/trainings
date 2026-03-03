import fs from "fs";
import path from "path";

/**
 * Resolve the content directory robustly for both local dev (monorepo)
 * and production (Vercel standalone output).
 */
function resolveContentDir(): string {
  const candidates = [
    process.env.CONTENT_DIR, // explicit override
    path.join(process.cwd(), "..", "..", "content", "paths"), // monorepo: apps/web -> root
    path.join(process.cwd(), "content", "paths"), // standalone output
    path.join(process.cwd(), "..", "content", "paths"), // alternate monorepo layout
  ].filter(Boolean) as string[];

  for (const dir of candidates) {
    try {
      if (fs.existsSync(dir)) return dir;
    } catch {
      // permission or path error, try next
    }
  }

  console.error(
    "[content] Content directory not found. Tried:",
    candidates.join(", "),
  );
  // Return the monorepo default — will fail gracefully downstream
  return path.join(process.cwd(), "..", "..", "content", "paths");
}

const CONTENT_DIR = resolveContentDir();

export interface PathMeta {
  id: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  difficulty: string;
  estimatedHours: number;
  icon: string;
  color: string;
  modules: string[];
  capstoneProject: string;
}

export interface LessonRef {
  slug: string;
  title: string;
  order: number;
}

export interface ModuleMeta {
  id: string;
  title: string;
  slug: string;
  pathSlug: string;
  description: string;
  order: number;
  estimatedHours: number;
  lessonsCount: number;
  lessons: LessonRef[];
}

function readJson<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getAllPaths(): PathMeta[] {
  const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
  const paths: PathMeta[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pathJson = path.join(CONTENT_DIR, entry.name, "path.json");
    const meta = readJson<PathMeta>(pathJson);
    if (meta) paths.push(meta);
  }

  return paths.sort((a, b) => a.order - b.order);
}

export function getPath(slug: string): PathMeta | null {
  const pathJson = path.join(CONTENT_DIR, slug, "path.json");
  return readJson<PathMeta>(pathJson);
}

export function getModulesForPath(pathSlug: string): ModuleMeta[] {
  const pathMeta = getPath(pathSlug);
  if (!pathMeta) return [];

  const modules: ModuleMeta[] = [];

  for (const moduleSlug of pathMeta.modules) {
    const moduleJson = path.join(
      CONTENT_DIR,
      pathSlug,
      moduleSlug,
      "module.json",
    );
    const meta = readJson<ModuleMeta>(moduleJson);
    if (meta) modules.push(meta);
  }

  return modules.sort((a, b) => a.order - b.order);
}

export function getModule(
  pathSlug: string,
  moduleSlug: string,
): ModuleMeta | null {
  const moduleJson = path.join(
    CONTENT_DIR,
    pathSlug,
    moduleSlug,
    "module.json",
  );
  return readJson<ModuleMeta>(moduleJson);
}

export function getPathWithModules(slug: string) {
  const pathMeta = getPath(slug);
  if (!pathMeta) return null;

  const modules = getModulesForPath(slug);
  const totalLessons = modules.reduce((sum, m) => sum + m.lessonsCount, 0);

  return {
    ...pathMeta,
    modulesData: modules,
    totalLessons,
    totalModules: modules.length,
  };
}
