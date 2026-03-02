import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm transition-shadow group-hover:shadow-md">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold tracking-tight text-foreground">
          DevOps
        </span>
        <span className="text-lg font-bold tracking-tight text-primary">
          Engineers
        </span>
      </div>
    </Link>
  );
}
