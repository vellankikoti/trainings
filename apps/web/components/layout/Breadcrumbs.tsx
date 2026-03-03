"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

/**
 * Human-readable labels for route segments.
 * Slugs not in this map are title-cased automatically.
 */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  paths: "Learning Paths",
  learn: "Learn",
  jobs: "Jobs",
  settings: "Settings",
  trainer: "Trainer",
  institute: "Institute",
  organization: "Organization",
  admin: "Admin",
  analytics: "Analytics",
  billing: "Billing",
  candidates: "Candidates",
};

function slugToTitle(slug: string): string {
  return (
    SEGMENT_LABELS[slug] ??
    slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show on dashboard (it's the home page)
  if (pathname === "/dashboard" || pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return null;

  // Build crumbs: each segment becomes a breadcrumb
  const crumbs = segments.map((segment, index) => ({
    label: slugToTitle(segment),
    href: "/" + segments.slice(0, index + 1).join("/"),
    isLast: index === segments.length - 1,
  }));

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1 text-sm text-muted-foreground">
        <li>
          <Link
            href="/dashboard"
            className="flex items-center transition-colors hover:text-foreground"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
            {crumb.isLast ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
