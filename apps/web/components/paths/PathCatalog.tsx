"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CatalogFilters } from "./CatalogFilters";
import { ProgressBar } from "@/components/shared/ProgressBar";

export interface CatalogPath {
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  color: string;
  moduleCount: number;
  lessonCount: number;
  estimatedHours: number;
  /** User's progress percentage (0-100), null if not enrolled */
  progress: number | null;
}

interface PathCatalogProps {
  paths: CatalogPath[];
}

export function PathCatalog({ paths }: PathCatalogProps) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");

  const filtered = useMemo(() => {
    return paths.filter((p) => {
      const matchesSearch =
        search === "" ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());

      const matchesDifficulty =
        difficulty === "All" || p.difficulty === difficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [paths, search, difficulty]);

  return (
    <div>
      <CatalogFilters
        search={search}
        onSearchChange={setSearch}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
      />

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-border/80 p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No learning paths match your filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setDifficulty("All");
            }}
            className="mt-3 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {filtered.map((p) => (
            <CatalogCard key={p.slug} path={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function CatalogCard({ path }: { path: CatalogPath }) {
  return (
    <Link
      href={`/paths/${path.slug}`}
      className="group block rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">{path.title}</h3>
        <DifficultyBadge difficulty={path.difficulty} color={path.color} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {path.description}
      </p>

      {/* Progress overlay for enrolled users */}
      {path.progress !== null && (
        <div className="mt-4">
          <ProgressBar
            value={path.progress}
            size="md"
            showLabel
            ariaLabel={`${path.title} progress`}
          />
        </div>
      )}

      {/* Stats footer */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-center text-sm">
        <div>
          <div className="font-semibold text-foreground">{path.moduleCount}</div>
          <div className="text-xs text-muted-foreground">Courses</div>
        </div>
        <div>
          <div className="font-semibold text-foreground">{path.lessonCount}+</div>
          <div className="text-xs text-muted-foreground">Lessons</div>
        </div>
        <div>
          <div className="font-semibold text-foreground">{path.estimatedHours}h</div>
          <div className="text-xs text-muted-foreground">Est. Time</div>
        </div>
      </div>
    </Link>
  );
}

const COLOR_MAP: Record<string, string> = {
  green: "bg-green-500/10 text-green-700 dark:text-green-400",
  blue: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  red: "bg-red-500/10 text-red-700 dark:text-red-400",
  orange: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  yellow: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  purple: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
};

function DifficultyBadge({
  difficulty,
  color,
}: {
  difficulty: string;
  color: string;
}) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${COLOR_MAP[color] || ""}`}
    >
      {difficulty}
    </span>
  );
}
