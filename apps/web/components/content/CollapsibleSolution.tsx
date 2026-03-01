"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CollapsibleSolutionProps {
  children: React.ReactNode;
}

export function CollapsibleSolution({ children }: CollapsibleSolutionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-4 rounded-lg border border-dashed">
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => setOpen(!open)}
      >
        {open ? "▾ Hide Solution" : "▸ Show Solution"}
      </Button>
      {open && <div className="border-t p-4">{children}</div>}
    </div>
  );
}
