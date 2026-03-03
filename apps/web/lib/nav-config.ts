export interface NavItem {
  label: string;
  href: string;
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
 * Focused on productivity: dashboard first, then course discovery.
 */
export const AUTH_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Courses", href: "/courses" },
  { label: "Paths", href: "/paths" },
];

/** @deprecated Use PUBLIC_NAV_ITEMS or AUTH_NAV_ITEMS instead */
export const NAV_ITEMS: NavItem[] = PUBLIC_NAV_ITEMS;
