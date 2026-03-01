import Link from "next/link";

const FOOTER_LINKS = [
  {
    title: "Platform",
    links: [
      { label: "Learning Paths", href: "/paths" },
      { label: "Projects", href: "/projects" },
      { label: "Certificates", href: "/certificates" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "About", href: "/about" },
      { label: "Contributing", href: "/contributing" },
      { label: "Code of Conduct", href: "/code-of-conduct" },
      { label: "GitHub", href: "https://github.com/vellankikoti/trainings" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "MIT License", href: "/license" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="text-lg font-bold">DEVOPS ENGINEERS</div>
            <p className="mt-2 text-sm text-muted-foreground">
              From Zero to Production-Ready. Training 1 million engineers
              through open-source, story-driven learning.
            </p>
          </div>
          {FOOTER_LINKS.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold">{section.title}</h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      {...(link.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} DEVOPS ENGINEERS Community. Open
          source under MIT License.
        </div>
      </div>
    </footer>
  );
}
