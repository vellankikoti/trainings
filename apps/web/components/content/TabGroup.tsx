"use client";

import React, { useState, Children, isValidElement } from "react";

interface TabGroupProps {
  children: React.ReactNode;
}

interface TabProps {
  label: string;
  children: React.ReactNode;
}

export function TabGroup({ children }: TabGroupProps) {
  const tabs = Children.toArray(children).filter(
    (child): child is React.ReactElement<TabProps> =>
      isValidElement(child),
  );

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border/60 bg-muted/30 px-2 pt-2" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === activeIndex}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-medium transition-all ${
              i === activeIndex
                ? "bg-card text-foreground shadow-sm border border-border/60 border-b-card -mb-px"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
            onClick={() => setActiveIndex(i)}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div className="p-5 text-[0.938rem] leading-relaxed [&>p]:mb-3 [&>p:last-child]:mb-0 [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm" role="tabpanel">
        {tabs[activeIndex]}
      </div>
    </div>
  );
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}
