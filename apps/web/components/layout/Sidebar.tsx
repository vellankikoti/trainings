"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav-config";
import type { Role } from "@/lib/auth/rbac";
import {
  LayoutDashboard,
  BookOpen,
  Briefcase,
  GraduationCap,
  Building2,
  Building,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Check,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BookOpen,
  Briefcase,
  GraduationCap,
  Building2,
  Building,
  Shield,
  Settings,
};

/** Views available in the role switcher, keyed by role access. */
const ROLE_VIEWS: {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}[] = [
  {
    key: "learner",
    label: "Learner",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["learner", "trainer", "institute_admin", "recruiter", "org_admin", "admin", "super_admin"],
  },
  {
    key: "trainer",
    label: "Trainer",
    href: "/trainer",
    icon: GraduationCap,
    roles: ["trainer", "institute_admin", "admin", "super_admin"],
  },
  {
    key: "institute",
    label: "Institute",
    href: "/institute",
    icon: Building2,
    roles: ["institute_admin", "admin", "super_admin"],
  },
  {
    key: "organization",
    label: "Organization",
    href: "/organization",
    icon: Building,
    roles: ["recruiter", "org_admin", "admin", "super_admin"],
  },
  {
    key: "admin",
    label: "Admin",
    href: "/admin",
    icon: Shield,
    roles: ["admin", "super_admin"],
  },
];

interface SidebarProps {
  items: NavItem[];
  role?: Role;
}

export function Sidebar({ items, role = "learner" }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const mainItems = items.filter((item) => item.section === "main");
  const roleItems = items.filter((item) => item.section === "role");
  const settingsItems = items.filter((item) => item.section === "settings");

  const availableViews = ROLE_VIEWS.filter((v) => v.roles.includes(role));
  const hasMultipleViews = availableViews.length > 1;

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  // Determine which view is currently active based on pathname
  const activeView =
    availableViews.find((v) => v.href !== "/dashboard" && pathname.startsWith(v.href)) ??
    availableViews[0];

  return (
    <aside
      className={cn(
        "sticky top-0 z-40 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:flex",
        collapsed ? "w-[68px]" : "w-60",
      )}
    >
      {/* Logo area */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border px-4",
          collapsed ? "justify-center" : "gap-2",
        )}
      >
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
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
                <path d="m18 16 4-4-4-4" />
                <path d="m6 8-4 4 4 4" />
                <path d="m14.5 4-5 16" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              DEVOPS
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
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
              <path d="m18 16 4-4-4-4" />
              <path d="m6 8-4 4 4 4" />
              <path d="m14.5 4-5 16" />
            </svg>
          </div>
        )}
      </div>

      {/* Role Switcher — only shown for multi-role users */}
      {hasMultipleViews && (
        <div className={cn("border-b border-sidebar-border", collapsed ? "px-2 py-2" : "px-3 py-3")}>
          <RoleSwitcher
            views={availableViews}
            activeView={activeView}
            collapsed={collapsed}
          />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Main section */}
        <div className="space-y-1">
          {mainItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              active={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </div>

        {/* Role section */}
        {roleItems.length > 0 && (
          <>
            <div className="my-4 border-t border-sidebar-border" />
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                Manage
              </p>
            )}
            <div className="space-y-1">
              {roleItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Bottom: settings + collapse */}
      <div className="border-t border-sidebar-border px-3 py-3">
        {settingsItems.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

/* ── Role Switcher Dropdown ── */

function RoleSwitcher({
  views,
  activeView,
  collapsed,
}: {
  views: typeof ROLE_VIEWS;
  activeView: (typeof ROLE_VIEWS)[number];
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const ActiveIcon = activeView.icon;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
          collapsed && "justify-center px-2",
        )}
        title={collapsed ? `Switch view (${activeView.label})` : undefined}
      >
        <ActiveIcon className="h-4 w-4 shrink-0 text-primary" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left">{activeView.label}</span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/40" />
          </>
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-52 rounded-lg border border-sidebar-border bg-sidebar shadow-lg",
            collapsed ? "left-full ml-2 top-0" : "left-0 right-0 w-full",
          )}
        >
          <div className="p-1">
            <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
              Switch View
            </p>
            {views.map((view) => {
              const Icon = view.icon;
              const isCurrent = view.key === activeView.key;
              return (
                <button
                  key={view.key}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(view.href);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors",
                    isCurrent
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{view.label}</span>
                  {isCurrent && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const IconComponent = item.icon ? ICON_MAP[item.icon] : null;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-primary"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        collapsed && "justify-center px-2",
      )}
      title={collapsed ? item.label : undefined}
    >
      {IconComponent && <IconComponent className="h-4 w-4 shrink-0" />}
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}
