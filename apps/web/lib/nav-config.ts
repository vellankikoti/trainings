import type { Role } from "@/lib/auth/rbac";

export interface NavItem {
  label: string;
  href: string;
  /** Lucide icon name */
  icon?: string;
  /** Roles allowed to see this item. Omit for all authenticated users. */
  roles?: Role[];
  /** Section grouping for sidebar */
  section?: "main" | "role" | "settings";
}

/**
 * Navigation items for logged-OUT visitors (acquisition / marketing).
 */
export const PUBLIC_NAV_ITEMS: NavItem[] = [
  { label: "Paths", href: "/paths" },
  { label: "Courses", href: "/courses" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

/**
 * Sidebar items for logged-IN users.
 * Grouped by section for visual hierarchy.
 */
export const SIDEBAR_ITEMS: NavItem[] = [
  // ── Main section ──
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", section: "main" },
  { label: "My Courses", href: "/my-courses", icon: "BookOpen", section: "main" },
  { label: "Jobs", href: "/jobs", icon: "Briefcase", section: "main" },

  // ── Role-specific section ──
  {
    label: "Trainer",
    href: "/trainer",
    icon: "GraduationCap",
    section: "role",
    roles: ["trainer", "institute_admin", "admin", "super_admin"],
  },
  {
    label: "Institute",
    href: "/institute",
    icon: "Building2",
    section: "role",
    roles: ["institute_admin", "admin", "super_admin"],
  },
  {
    label: "Organization",
    href: "/organization",
    icon: "Building",
    section: "role",
    roles: ["recruiter", "org_admin", "admin", "super_admin"],
  },
  {
    label: "Admin",
    href: "/admin",
    icon: "Shield",
    section: "role",
    roles: ["admin", "super_admin"],
  },

  // ── Settings section ──
  { label: "Settings", href: "/settings", icon: "Settings", section: "settings" },
];

/**
 * Navigation items for logged-IN users (header — simplified).
 */
export const AUTH_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Paths", href: "/paths" },
  { label: "Jobs", href: "/jobs" },
];

/**
 * Role-specific navigation items that appear after the common items.
 */
export const ROLE_NAV_ITEMS: NavItem[] = [
  {
    label: "Trainer",
    href: "/trainer",
    roles: ["trainer", "institute_admin", "admin", "super_admin"],
  },
  {
    label: "Institute",
    href: "/institute",
    roles: ["institute_admin", "admin", "super_admin"],
  },
  {
    label: "Organization",
    href: "/organization",
    roles: ["recruiter", "org_admin", "admin", "super_admin"],
  },
  {
    label: "Admin",
    href: "/admin",
    roles: ["admin", "super_admin"],
  },
];

/**
 * Get sidebar items filtered for a given role.
 */
export function getSidebarItemsForRole(role: Role): NavItem[] {
  return SIDEBAR_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role),
  );
}

/**
 * Filter role-specific nav items for a given role.
 */
export function getNavItemsForRole(role: Role): NavItem[] {
  return [
    ...AUTH_NAV_ITEMS,
    ...ROLE_NAV_ITEMS.filter(
      (item) => !item.roles || item.roles.includes(role),
    ),
  ];
}

/** @deprecated Use PUBLIC_NAV_ITEMS or AUTH_NAV_ITEMS instead */
export const NAV_ITEMS: NavItem[] = PUBLIC_NAV_ITEMS;
