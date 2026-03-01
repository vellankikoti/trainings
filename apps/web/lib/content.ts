import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "..", "..", "content", "paths");

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
