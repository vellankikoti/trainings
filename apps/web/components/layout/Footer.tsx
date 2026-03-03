import Link from "next/link";
import { PUBLIC_NAV_ITEMS } from "@/lib/nav-config";

const FOOTER_LINKS = [
  {
    title: "Platform",
    links: PUBLIC_NAV_ITEMS,
  },
  {
    title: "Community",
    links: [
      { label: "GitHub", href: "https://github.com/vellankikoti/trainings" },
      { label: "Contributing", href: "https://github.com/vellankikoti/trainings/blob/main/CONTRIBUTING.md" },
      { label: "Code of Conduct", href: "https://github.com/vellankikoti/trainings/blob/main/CODE_OF_CONDUCT.md" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "MIT License", href: "https://github.com/vellankikoti/trainings/blob/main/LICENSE" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white">
                <svg
                  width="14"
                  height="14"
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
              <span className="text-base font-bold">
                DevOps <span className="text-primary">Engineers</span>
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              From Zero to Production-Ready. Training 1 million engineers
              through open-source, story-driven learning.
            </p>
          </div>
          {FOOTER_LINKS.map((section) => (
            <nav key={section.title} aria-label={`${section.title} links`}>
              <h3 className="text-sm font-semibold">{section.title}</h3>
              <ul className="mt-3 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      {...(link.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-10 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} DevOps Engineers Community. Open
          source under MIT License.
        </div>
      </div>
    </footer>
  );
}
