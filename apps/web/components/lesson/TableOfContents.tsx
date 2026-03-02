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
    <nav className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-foreground/50">
        On this page
      </p>
      <div className="space-y-0.5 border-l-2 border-border/60">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`block py-1.5 text-[13px] leading-snug transition-all ${
              h.depth === 3 ? "pl-6" : h.depth === 4 ? "pl-9" : "pl-3"
            } ${
              activeId === h.id
                ? "font-semibold text-primary border-l-2 border-primary -ml-[2px]"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {h.text}
          </a>
        ))}
      </div>
    </nav>
  );
}
