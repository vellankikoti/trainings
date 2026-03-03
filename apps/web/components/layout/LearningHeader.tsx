"use client";

import Link from "next/link";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface LearningHeaderProps {
  /** Back link href (course overview or path page) */
  backHref: string;
  /** Course/module title shown in the header */
  courseTitle: string;
  /** Overall course progress percentage (0-100) */
  progress: number;
  /** Callback to toggle sidebar visibility */
  onToggleSidebar: () => void;
  /** Whether sidebar is currently open */
  isSidebarOpen: boolean;
}

export function LearningHeader({
  backHref,
  courseTitle,
  progress,
  onToggleSidebar,
  isSidebarOpen,
}: LearningHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-border/60 bg-background/95 px-4 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      {/* Left section: toggle + back + title */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Sidebar toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-foreground/60 transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={isSidebarOpen}
          aria-controls="learning-sidebar"
        >
          {isSidebarOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
              <path d="m14 9 3 3-3 3" />
            </svg>
          )}
        </button>

        {/* Back to course overview */}
        <Link
          href={backHref}
          className="hidden items-center gap-1 text-xs font-medium text-foreground/50 transition-colors hover:text-foreground sm:flex"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Course
        </Link>

        {/* Divider */}
        <div className="hidden h-4 w-px bg-border/60 sm:block" />

        {/* Course title */}
        <span className="truncate text-sm font-semibold text-foreground">
          {courseTitle}
        </span>
      </div>

      {/* Right section: progress + theme + user */}
      <div className="flex items-center gap-3">
        {/* Progress bar (hidden on very small screens) */}
        <div className="hidden w-32 items-center gap-2 sm:flex">
          <ProgressBar
            value={progress}
            size="sm"
            ariaLabel={`Course progress: ${Math.round(progress)}%`}
          />
          <span className="shrink-0 text-[11px] font-bold tabular-nums text-foreground/50">
            {Math.round(progress)}%
          </span>
        </div>

        <ThemeToggle />

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </header>
  );
}
