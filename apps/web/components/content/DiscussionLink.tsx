"use client";

interface DiscussionLinkProps {
  /** The learning path slug (used as discussion category) */
  pathSlug: string;
  /** The lesson title for pre-filling the discussion title */
  lessonTitle: string;
  /** The lesson slug for reference */
  lessonSlug: string;
}

const REPO_URL = "https://github.com/vellankikoti/trainings";

export function DiscussionLink({
  pathSlug,
  lessonTitle,
  lessonSlug,
}: DiscussionLinkProps) {
  const discussionUrl = `${REPO_URL}/discussions/new?category=${encodeURIComponent(pathSlug)}&title=${encodeURIComponent(`Question about: ${lessonTitle}`)}&body=${encodeURIComponent(`## Question\n\n<!-- Describe your question about the lesson "${lessonTitle}" -->\n\n## Context\n\nLesson: \`${lessonSlug}\`\nPath: \`${pathSlug}\`\n`)}`;

  return (
    <div className="mt-12 rounded-lg border bg-muted/30 p-6">
      <h3 className="text-lg font-semibold">Have a Question?</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Stuck on something or want to discuss this lesson with other learners?
        Join the conversation on GitHub Discussions.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={discussionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <svg
            className="h-4 w-4"
            fill="currentColor"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path d="M1.5 1.875C1.5 1.39175 1.89175 1 2.375 1h11.25c.4832 0 .875.39175.875.875v8.25c0 .4832-.3918.875-.875.875H8.604L5.073 14.56a.5.5 0 0 1-.823-.382V11H2.375A.875.875 0 0 1 1.5 10.125v-8.25ZM13 2.5H3v7h2v2.19l2.573-2.19H13v-7Z" />
          </svg>
          Ask a Question
        </a>
        <a
          href={`${REPO_URL}/discussions?discussions_q=category%3A${encodeURIComponent(pathSlug)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Browse Discussions
        </a>
      </div>
    </div>
  );
}
