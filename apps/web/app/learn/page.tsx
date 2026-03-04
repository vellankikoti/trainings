import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getAllPaths, getModulesForPath } from "@/lib/content";
import { getProfileId } from "@/lib/progress";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Learning Paths",
};

async function getPathProgress(): Promise<Map<string, number>> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new Map();

    const profileId = await getProfileId(clerkId);
    if (!profileId) return new Map();

    const supabase = createAdminClient();
    const { data } = await supabase
      .from("path_progress")
      .select("path_slug, percentage")
      .eq("user_id", profileId);

    const progress = new Map<string, number>();
    for (const row of data ?? []) {
      progress.set(row.path_slug, row.percentage);
    }
    return progress;
  } catch {
    return new Map();
  }
}

export default async function LearnPage() {
  const paths = getAllPaths();
  const pathProgress = await getPathProgress();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">Learning Paths</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Choose a path and start learning. Each path contains multiple modules
            with hands-on lessons to guide you from beginner to advanced.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((path) => {
            const modules = getModulesForPath(path.slug);
            const moduleCount = modules.length;
            const progress = pathProgress.get(path.slug);
            const hasProgress = progress !== undefined && progress > 0;

            return (
              <Link
                key={path.slug}
                href={`/learn/${path.slug}`}
                className="group flex flex-col rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex flex-1 flex-col p-6">
                  {/* Icon */}
                  {path.icon && (
                    <span className="text-2xl" role="img" aria-hidden="true">
                      {path.icon}
                    </span>
                  )}

                  {/* Title */}
                  <h2 className="mt-3 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                    {path.title}
                  </h2>

                  {/* Description */}
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {path.description}
                  </p>

                  {/* Module count */}
                  <div className="mt-4 text-xs font-medium text-muted-foreground">
                    {moduleCount} {moduleCount === 1 ? "module" : "modules"}
                  </div>
                </div>

                {/* Progress footer */}
                <div className="border-t border-border/40 px-6 py-3">
                  {hasProgress ? (
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground">
                          {progress}% complete
                        </span>
                        {progress === 100 ? (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            Completed
                          </span>
                        ) : (
                          <span className="font-semibold text-primary">
                            Continue
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Not started</span>
                      <span className="font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Start Path
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
