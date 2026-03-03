import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { PUBLIC_NAV_ITEMS, AUTH_NAV_ITEMS } from "@/lib/nav-config";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";
import { SearchDialog } from "./SearchDialog";
import { ReadingProgress } from "@/components/lesson/ReadingProgress";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <MobileNav />
          <Logo />

          {/* ── Auth-aware navigation ── */}
          <SignedOut>
            <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
              {PUBLIC_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SignedOut>
          <SignedIn>
            <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
              {AUTH_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SignedIn>
        </div>

        <div className="flex items-center gap-1.5">
          <SearchDialog />
          <ThemeToggle />
          <SignedOut>
            <Button variant="ghost" size="sm" asChild className="ml-1">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
      {/* Reading progress — sits at the absolute bottom of the header, replacing the border */}
      <div className="absolute bottom-0 left-0 right-0">
        <ReadingProgress />
      </div>
    </header>
  );
}
