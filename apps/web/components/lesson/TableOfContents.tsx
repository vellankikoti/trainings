"use client";

import { useEffect, useState } from "react";

interface Heading {
  depth: number;
  text: string;
  id: string;
}

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" },
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-0.5">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className={`block rounded-md py-1.5 text-[13px] leading-snug transition-colors ${
            h.depth === 3 ? "pl-4" : h.depth === 4 ? "pl-8" : "pl-0"
          } ${
            activeId === h.id
              ? "font-medium text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {h.text}
        </a>
      ))}
    </nav>
  );
}
