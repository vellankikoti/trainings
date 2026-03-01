import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: item.href } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center gap-1">
                {index > 0 && <span className="mx-1">/</span>}
                {isLast || !item.href ? (
                  <span
                    className={isLast ? "font-medium text-foreground" : ""}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {/* On mobile, collapse middle items */}
                    <span className={items.length > 3 && index > 0 && !isLast ? "hidden sm:inline" : ""}>
                      {item.label}
                    </span>
                    {items.length > 3 && index > 0 && !isLast && (
                      <span className="sm:hidden">...</span>
                    )}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-foreground"
                  >
                    <span className={items.length > 3 && index > 0 && !isLast ? "hidden sm:inline" : ""}>
                      {item.label}
                    </span>
                    {items.length > 3 && index > 0 && !isLast && (
                      <span className="sm:hidden">...</span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
