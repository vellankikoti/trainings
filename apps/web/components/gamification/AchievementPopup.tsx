"use client";

import { useEffect, useState } from "react";

interface AchievementPopupProps {
  title: string;
  description: string;
  icon: string;
  show: boolean;
  onComplete?: () => void;
}

export function AchievementPopup({
  title,
  description,
  icon,
  show,
  onComplete,
}: AchievementPopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 right-8 z-50 animate-slide-up">
      <div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xl">
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-primary">Achievement Unlocked!</p>
          <p className="font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
