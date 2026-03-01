"use client";

import { useRef } from "react";
import { CopyButton } from "./CopyButton";

interface CodeBlockProps {
  children: React.ReactNode;
  filename?: string;
  className?: string;
}

export function CodeBlock({ children, filename }: CodeBlockProps) {
  const preRef = useRef<HTMLDivElement>(null);

  function getTextContent(): string {
    if (!preRef.current) return "";
    return preRef.current.textContent || "";
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border bg-muted/50">
      {filename && (
        <div className="flex items-center justify-between border-b bg-muted px-4 py-2 text-xs text-muted-foreground">
          <span>{filename}</span>
          <CopyButton text={getTextContent()} />
        </div>
      )}
      {!filename && (
        <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
          <CopyButton text={getTextContent()} />
        </div>
      )}
      <div ref={preRef} className="overflow-x-auto p-4 text-sm">
        {children}
      </div>
    </div>
  );
}
