"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { PUBLIC_NAV_ITEMS, AUTH_NAV_ITEMS, ROLE_NAV_ITEMS } from "@/lib/nav-config";
import {
  LayoutDashboard,
  BookOpen,
  Briefcase,
  GraduationCap,
  Building2,
  Building,
  Shield,
  Settings,
  Menu,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Dashboard: LayoutDashboard,
  Paths: BookOpen,
  "My Courses": BookOpen,
  Jobs: Briefcase,
  Trainer: GraduationCap,
  Institute: Building2,
  Organization: Building,
  Admin: Shield,
  Settings,
};

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex h-14 items-center border-b border-border/60 px-5">
          <SheetTitle className="text-sm font-bold tracking-tight">DEVOPS ENGINEERS</SheetTitle>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-4">
          <SignedOut>
            {PUBLIC_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                {item.label}
              </Link>
            ))}
            <div className="my-2 border-t border-border/60" />
            <div className="flex flex-col gap-2 px-3">
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                Get Started
              </Link>
            </div>
          </SignedOut>

          <SignedIn>
            {AUTH_NAV_ITEMS.map((item) => {
              const Icon = ICON_MAP[item.label];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-accent text-primary"
                      : "text-foreground/70 hover:bg-accent hover:text-foreground",
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  {item.label}
                </Link>
              );
            })}

            {ROLE_NAV_ITEMS.length > 0 && (
              <>
                <div className="my-2 border-t border-border/60" />
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  Manage
                </p>
                {ROLE_NAV_ITEMS.map((item) => {
                  const Icon = ICON_MAP[item.label];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-accent text-primary"
                          : "text-foreground/70 hover:bg-accent hover:text-foreground",
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0" />}
                      {item.label}
                    </Link>
                  );
                })}
              </>
            )}

            <div className="my-2 border-t border-border/60" />
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive("/settings")
                  ? "bg-accent text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Settings className="h-4 w-4 shrink-0" />
              Settings
            </Link>
          </SignedIn>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
