"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LevelUpModalProps {
  open: boolean;
  onClose: () => void;
  level: number;
  title: string;
  totalXp: number;
}

const CONFETTI_COLORS = [
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
];

function ConfettiPiece({ delay, color }: { delay: number; color: string }) {
  const left = Math.random() * 100;
  const size = 6 + Math.random() * 6;
  const duration = 2 + Math.random() * 2;

  return (
    <div
      className="absolute top-0 animate-confetti"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      <div
        className="rotate-45"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

export function LevelUpModal({
  open,
  onClose,
  level,
  title,
  totalXp,
}: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleClose = useCallback(() => {
    setShowConfetti(false);
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Level Up!</DialogTitle>
          <DialogDescription className="sr-only">
            You reached level {level}
          </DialogDescription>
        </DialogHeader>

        {/* Confetti */}
        {showConfetti && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <ConfettiPiece
                key={i}
                delay={i * 0.05}
                color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center py-6 text-center">
          {/* Level badge */}
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-4 ring-primary/30">
            <span className="text-5xl font-bold text-primary">{level}</span>
          </div>

          <h2 className="mt-6 text-2xl font-bold">Level Up!</h2>
          <p className="mt-1 text-lg text-muted-foreground">
            You are now a <span className="font-semibold text-foreground">{title}</span>
          </p>

          <div className="mt-4 rounded-lg bg-muted/50 px-6 py-3">
            <span className="text-sm text-muted-foreground">Total XP</span>
            <p className="text-2xl font-bold">{totalXp.toLocaleString()}</p>
          </div>

          <Button onClick={handleClose} className="mt-6 w-full">
            Continue Learning
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
