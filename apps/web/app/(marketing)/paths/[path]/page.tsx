import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPaths, getPathWithModules } from "@/lib/content";
import { ModuleCard } from "@/components/paths/ModuleCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PathPageProps {
  params: { path: string };
}

export function generateStaticParams() {
  const paths = getAllPaths();
  return paths.map((p) => ({ path: p.slug }));
}

export function generateMetadata({ params }: PathPageProps): Metadata {
  const data = getPathWithModules(params.path);
  if (!data) return { title: "Path Not Found" };

  return {
    title: data.title,
    description: data.description,
  };
}

export default function PathPage({ params }: PathPageProps) {
  const data = getPathWithModules(params.path);
  if (!data) notFound();

  const COLOR_MAP: Record<string, string> = {
    green: "bg-green-500/10 text-green-700 dark:text-green-400",
    blue: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    red: "bg-red-500/10 text-red-700 dark:text-red-400",
    orange: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    yellow: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    purple: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  };

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/paths" className="hover:text-foreground">
          Paths
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{data.title}</span>
      </nav>

      {/* Hero */}
      <div className="mb-12">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold">{data.title}</h1>
          <Badge
            variant="outline"
            className={COLOR_MAP[data.color] || ""}
          >
            {data.difficulty}
          </Badge>
        </div>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
          {data.description}
        </p>
        <div className="mt-6 flex gap-6">
          <div>
            <div className="text-2xl font-bold">{data.totalModules}</div>
            <div className="text-sm text-muted-foreground">Modules</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{data.totalLessons}+</div>
            <div className="text-sm text-muted-foreground">Lessons</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{data.estimatedHours}h</div>
            <div className="text-sm text-muted-foreground">Est. Time</div>
          </div>
        </div>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link href="/sign-up">Start This Path</Link>
          </Button>
        </div>
      </div>

      {/* Module List */}
      <div>
        <h2 className="mb-6 text-2xl font-bold">Modules</h2>
        <div className="grid gap-4">
          {data.modulesData.map((mod) => (
            <ModuleCard
              key={mod.slug}
              pathSlug={data.slug}
              moduleSlug={mod.slug}
              title={mod.title}
              description={mod.description}
              order={mod.order}
              lessonsCount={mod.lessonsCount}
              estimatedHours={mod.estimatedHours}
              firstLessonSlug={mod.lessons[0]?.slug}
            />
          ))}
        </div>
      </div>

      {/* Capstone */}
      {data.capstoneProject && (
        <div className="mt-12 rounded-lg border bg-muted/50 p-6">
          <h2 className="text-xl font-bold">Capstone Project</h2>
          <p className="mt-2 text-muted-foreground">{data.capstoneProject}</p>
        </div>
      )}
    </div>
  );
}
