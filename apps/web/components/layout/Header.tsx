import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { PUBLIC_NAV_ITEMS } from "@/lib/nav-config";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";
import { SearchDialog } from "./SearchDialog";
import { ReadingProgress } from "@/components/lesson/ReadingProgress";
import { NotificationCenter } from "./NotificationCenter";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-sm shadow-[var(--shadow-xs)]">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-6">
          <MobileNav />
          {/* Logo visible on mobile, hidden on desktop (sidebar has it) */}
          <div className="lg:hidden">
            <Logo />
          </div>

          {/* Public nav — only for signed-out visitors */}
          <SignedOut>
            <div className="hidden lg:block">
              <Logo />
            </div>
            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-1 md:flex"
            >
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
            <NotificationCenter />
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
      {/* Reading progress — sits at the absolute bottom of the header */}
      <div className="absolute bottom-0 left-0 right-0">
        <ReadingProgress />
      </div>
    </header>
  );
}
