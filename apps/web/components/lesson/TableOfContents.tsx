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
    <nav className="space-y-1 text-sm">
      <p className="mb-3 font-semibold">On this page</p>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className={`block py-1 transition-colors ${
            h.depth === 3 ? "pl-4" : h.depth === 4 ? "pl-8" : ""
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
