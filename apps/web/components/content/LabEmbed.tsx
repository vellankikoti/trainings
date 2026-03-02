"use client";

import { CopyButton } from "./CopyButton";

interface LabEmbedProps {
  labId: string;
  title?: string;
}

export function LabEmbed({ labId, title }: LabEmbedProps) {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Hands-on Lab</p>
            <h3 className="text-base font-bold text-foreground">{title || labId}</h3>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Docker requirement note */}
        <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="m10 8 4 4-4 4" />
          </svg>
          <p className="text-sm text-muted-foreground">
            This lab requires Docker to run locally.
          </p>
        </div>

        {/* Terminal-style command block */}
        <div className="overflow-hidden rounded-lg bg-[hsl(215,28%,10%)]">
          <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[hsl(215,28%,13%)] px-4 py-2">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            <span className="ml-2 font-mono text-xs text-[hsl(215,16%,50%)]">Terminal</span>
          </div>
          <div className="p-4 font-mono text-sm leading-relaxed text-[hsl(210,40%,90%)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[hsl(215,16%,45%)]"># Install the lab CLI</div>
                <div>
                  <span className="text-emerald-400">$</span> pnpm --filter @devops-engineers/lab-cli dev -- start {labId}
                </div>
                <div className="mt-3 text-[hsl(215,16%,45%)]"># Validate exercises</div>
                <div>
                  <span className="text-emerald-400">$</span> pnpm --filter @devops-engineers/lab-cli dev -- validate {labId}
                </div>
              </div>
              <CopyButton text={`pnpm --filter @devops-engineers/lab-cli dev -- start ${labId}`} />
            </div>
          </div>
        </div>

        {/* GitHub Codespaces */}
        <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Open in GitHub Codespaces</h4>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Launch a pre-configured cloud development environment
            </p>
          </div>
          <a
            href={`https://github.com/codespaces/new?repo=devops-engineers&devcontainer_path=labs/devcontainers/foundations/.devcontainer/devcontainer.json`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            Codespaces
          </a>
        </div>
      </div>
    </div>
  );
}
