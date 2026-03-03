"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";

const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"] as const;

interface CatalogFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  difficulty: string;
  onDifficultyChange: (value: string) => void;
}

export function CatalogFilters({
  search,
  onSearchChange,
  difficulty,
  onDifficultyChange,
}: CatalogFiltersProps) {
  const handleSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange],
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div className="relative max-w-sm flex-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={handleSearchInput}
          placeholder="Search learning paths..."
          className="h-10 w-full rounded-lg border border-border/60 bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Search learning paths"
        />
      </div>

      {/* Difficulty filter */}
      <div className="flex gap-1 rounded-lg bg-muted p-1" role="tablist" aria-label="Filter by difficulty">
        {DIFFICULTIES.map((level) => (
          <button
            key={level}
            type="button"
            role="tab"
            aria-selected={difficulty === level}
            onClick={() => onDifficultyChange(level)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
              difficulty === level
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}
