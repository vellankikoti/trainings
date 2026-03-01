import type { Metadata } from "next";
import { getAllPaths, getModulesForPath } from "@/lib/content";
import { PathCard } from "@/components/paths/PathCard";

export const metadata: Metadata = {
  title: "Learning Paths",
  description:
    "6 structured learning paths to take you from zero to production-ready DevOps engineer.",
};

export default function PathsPage() {
  const paths = getAllPaths();

  const pathsWithCounts = paths.map((p) => {
    const modules = getModulesForPath(p.slug);
    const totalLessons = modules.reduce((sum, m) => sum + m.lessonsCount, 0);
    return {
      ...p,
      moduleCount: modules.length,
      lessonCount: totalLessons,
    };
  });

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Learning Paths</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          6 structured paths designed to take you from complete beginner to
          production-ready DevOps engineer. Choose your starting point based on
          your experience level.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {pathsWithCounts.map((p) => (
          <PathCard
            key={p.slug}
            slug={p.slug}
            title={p.title}
            description={p.description}
            difficulty={p.difficulty}
            color={p.color}
            moduleCount={p.moduleCount}
            lessonCount={p.lessonCount}
            estimatedHours={p.estimatedHours}
          />
        ))}
      </div>
    </div>
  );
}
