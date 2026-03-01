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
    <div className="my-4 overflow-hidden rounded-lg border">
      <div className="flex border-b bg-muted" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === activeIndex}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              i === activeIndex
                ? "border-b-2 border-primary bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveIndex(i)}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div className="p-4" role="tabpanel">
        {tabs[activeIndex]}
      </div>
    </div>
  );
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}
