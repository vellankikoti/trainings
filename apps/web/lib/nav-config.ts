export interface NavItem {
  label: string;
  href: string;
}

/** Primary navigation links shown in Header, MobileNav, and Footer */
export const NAV_ITEMS: NavItem[] = [
  { label: "Learning Paths", href: "/paths" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];
