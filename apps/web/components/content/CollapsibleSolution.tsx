"use client";

import { useState, useRef, useEffect } from "react";

interface CollapsibleSolutionProps {
  children: React.ReactNode;
}

export function CollapsibleSolution({ children }: CollapsibleSolutionProps) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [open, children]);

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <button
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {/* Chevron */}
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
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>

        <div className="flex items-center gap-2">
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
            className="text-primary"
          >
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
          </svg>
          <span className="font-semibold text-foreground">
            {open ? "Hide Solution" : "Show Solution"}
          </span>
        </div>

        {!open && (
          <span className="ml-auto text-xs text-muted-foreground">
            Try it yourself first!
          </span>
        )}
      </button>

      {/* Animated content */}
      <div
        style={{ maxHeight: open ? `${height}px` : "0px" }}
        className="overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div ref={contentRef} className="border-t border-border/40 p-5 text-[0.938rem] leading-relaxed [&>p]:mb-3 [&>p:last-child]:mb-0 [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
