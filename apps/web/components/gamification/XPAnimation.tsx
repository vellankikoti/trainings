"use client";

import { useEffect, useState } from "react";

interface XPAnimationProps {
  xp: number;
  show: boolean;
  onComplete?: () => void;
}

export function XPAnimation({ xp, show, onComplete }: XPAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed bottom-20 right-8 z-50 animate-xp-float">
      <div className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg">
        +{xp} XP
      </div>
    </div>
  );
}
