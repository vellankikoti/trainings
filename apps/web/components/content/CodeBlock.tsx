"use client";

import { useRef } from "react";
import { CopyButton } from "./CopyButton";

interface CodeBlockProps {
  children: React.ReactNode;
  filename?: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ children, filename, language, className }: CodeBlockProps) {
  const preRef = useRef<HTMLDivElement>(null);

  // Try to extract language from className (e.g., "language-bash")
  const lang = language || className?.replace("language-", "").toUpperCase() || "";

  function getTextContent(): string {
    if (!preRef.current) return "";
    return preRef.current.textContent || "";
  }

  return (
    <div className="not-prose group relative my-6 overflow-hidden rounded-xl bg-[hsl(215,28%,10%)] shadow-lg">
      {/* Header bar */}
      {(filename || lang) && (
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-[hsl(215,28%,13%)] px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            {filename && (
              <span className="font-mono text-xs text-[hsl(215,16%,50%)]">
                {filename}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {lang && (
              <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[hsl(215,16%,50%)]">
                {lang}
              </span>
            )}
            <CopyButton text={getTextContent()} />
          </div>
        </div>
      )}

      {!filename && !lang && (
        <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
          <CopyButton text={getTextContent()} />
        </div>
      )}

      <div ref={preRef} className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-[hsl(210,40%,90%)]">
        {children}
      </div>
    </div>
  );
}
