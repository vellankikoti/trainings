"use client";

/**
 * KeyTakeaways — a summary card placed at the bottom of lesson content,
 * above the completion section. Provides a quick mental recap before
 * the learner confirms completion.
 *
 * When `key_takeaways` is missing or empty in frontmatter, this component
 * renders nothing — zero layout impact.
 */

interface KeyTakeawaysProps {
  takeaways: string[];
}

export function KeyTakeaways({ takeaways }: KeyTakeawaysProps) {
  if (!takeaways || takeaways.length === 0) return null;

  return (
    <div className="mt-12 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.02] p-6">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
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
            className="text-primary"
          >
            <path d="M12 2v4" />
            <path d="m6.343 6.343-1.414-1.414" />
            <path d="M2 12h4" />
            <path d="m17.657 6.343 1.414-1.414" />
            <path d="M22 12h-4" />
            <circle cx="12" cy="12" r="4" />
            <path d="M12 22v-4" />
          </svg>
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
          Key Takeaways
        </h3>
      </div>

      {/* Takeaway list */}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {takeaways.map((takeaway, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 rounded-xl bg-white/60 px-3.5 py-3 dark:bg-white/[0.03]"
          >
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <span className="text-sm leading-snug text-foreground/85">
              {takeaway}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
