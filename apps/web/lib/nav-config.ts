import type { Role } from "@/lib/auth/rbac";

export interface NavItem {
  label: string;
  href: string;
  /** Roles allowed to see this item. Omit for all authenticated users. */
  roles?: Role[];
}

/**
 * Navigation items for logged-OUT visitors (acquisition / marketing).
 * Focused on discovery: explore paths, browse courses, learn about us.
 */
export const PUBLIC_NAV_ITEMS: NavItem[] = [
  { label: "Paths", href: "/paths" },
  { label: "Courses", href: "/courses" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

/**
 * Navigation items for logged-IN users (product / learning).
 * Shared items visible to all authenticated users.
 */
export const AUTH_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Courses", href: "/courses" },
  { label: "Paths", href: "/paths" },
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
 * Filter role-specific nav items for a given role.
 */
export function getNavItemsForRole(role: Role): NavItem[] {
  return [
    ...AUTH_NAV_ITEMS,
    ...ROLE_NAV_ITEMS.filter(
      (item) => !item.roles || item.roles.includes(role)
    ),
  ];
}

/** @deprecated Use PUBLIC_NAV_ITEMS or AUTH_NAV_ITEMS instead */
export const NAV_ITEMS: NavItem[] = PUBLIC_NAV_ITEMS;
