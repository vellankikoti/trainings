import Link from "next/link";
import { listLabs } from "@/lib/labs/lab-content";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function LabsPage() {
  const labs = listLabs();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Hands-on Labs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Practice DevOps skills in real, isolated environments.
        </p>
      </div>

      {labs.length === 0 ? (
        <div className="rounded-xl border border-border/60 p-8 text-center text-muted-foreground">
          No labs available yet. Check back soon!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {labs.map((lab) => (
            <Link
              key={lab.name}
              href={`/labs/${lab.name}`}
              className="group rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                    DIFFICULTY_COLORS[lab.difficulty] ??
                    "bg-muted text-muted-foreground"
                  }`}
                >
                  {lab.difficulty}
                </span>
              </div>

              <h3 className="mt-3 text-base font-bold text-foreground group-hover:text-primary">
                {lab.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {lab.description}
              </p>

              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {lab.duration} min
                </span>
                <span className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  {lab.exercises.length} exercises
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
