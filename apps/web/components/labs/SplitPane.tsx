"use client";

import { useCallback, useRef, useState, useEffect } from "react";

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  /** Initial width of left panel as percentage (default: 40) */
  defaultLeftPercent?: number;
  /** Minimum width of left panel in pixels */
  minLeftPx?: number;
  /** Minimum width of right panel in pixels */
  minRightPx?: number;
}

export function SplitPane({
  left,
  right,
  defaultLeftPercent = 40,
  minLeftPx = 280,
  minRightPx = 400,
}: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftPercent, setLeftPercent] = useState(defaultLeftPercent);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const totalWidth = rect.width;
      const x = e.clientX - rect.left;

      // Enforce minimum widths
      const leftPx = Math.max(minLeftPx, Math.min(x, totalWidth - minRightPx));
      const percent = (leftPx / totalWidth) * 100;

      setLeftPercent(percent);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, minLeftPx, minRightPx]);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full overflow-hidden"
      style={{ cursor: isDragging ? "col-resize" : undefined }}
    >
      {/* Left panel */}
      <div
        className="h-full overflow-hidden"
        style={{ width: `${leftPercent}%` }}
      >
        {left}
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`group relative z-10 flex w-1.5 shrink-0 cursor-col-resize items-center justify-center transition-colors ${
          isDragging
            ? "bg-primary"
            : "bg-border/60 hover:bg-primary/50"
        }`}
      >
        <div
          className={`absolute h-8 w-4 rounded-sm ${
            isDragging ? "bg-primary" : "bg-border group-hover:bg-primary/50"
          }`}
        >
          <div className="flex h-full flex-col items-center justify-center gap-0.5">
            <div className="h-0.5 w-1 rounded-full bg-muted-foreground/40" />
            <div className="h-0.5 w-1 rounded-full bg-muted-foreground/40" />
            <div className="h-0.5 w-1 rounded-full bg-muted-foreground/40" />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="h-full flex-1 overflow-hidden">{right}</div>
    </div>
  );
}
