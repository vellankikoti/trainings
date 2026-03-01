"use client";

interface LabEmbedProps {
  labId: string;
  title?: string;
}

export function LabEmbed({ labId, title }: LabEmbedProps) {
  return (
    <div className="my-6 rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-primary">
              Hands-on Lab
            </div>
            <h3 className="text-lg font-semibold">{title || labId}</h3>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            This lab requires Docker to run locally.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <h4 className="text-sm font-medium">Run Locally</h4>
            <div className="mt-1 rounded bg-muted p-3 font-mono text-sm">
              <div className="text-muted-foreground"># Install the lab CLI</div>
              <div>pnpm --filter @devops-engineers/lab-cli dev -- start {labId}</div>
              <div className="mt-2 text-muted-foreground"># Validate exercises</div>
              <div>pnpm --filter @devops-engineers/lab-cli dev -- validate {labId}</div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium">Open in GitHub Codespaces</h4>
            <a
              href={`https://github.com/codespaces/new?repo=devops-engineers&devcontainer_path=labs/devcontainers/foundations/.devcontainer/devcontainer.json`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-muted"
            >
              Open in Codespaces
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
