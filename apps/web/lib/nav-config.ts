export interface NavItem {
  label: string;
  href: string;
}

/** Primary navigation links shown in Header, MobileNav, and Footer */
export const NAV_ITEMS: NavItem[] = [
  { label: "Paths", href: "/paths" },
  { label: "Courses", href: "/courses" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];
