import { notFound } from "next/navigation";
import { getPath } from "@/lib/content";

interface PathLayoutProps {
  children: React.ReactNode;
  params: Promise<{ path: string }>;
}

/**
 * Minimal wrapper for the learning path route group.
 * Validates the path exists, then renders children.
 *
 * The actual shell (sidebar, header) is handled by:
 * - Path Dashboard page (renders its own header inline)
 * - Course Layout at [module]/layout.tsx (renders CourseShell)
 */
export default async function PathLayout({
  children,
  params,
}: PathLayoutProps) {
  const { path: pathSlug } = await params;

  // Validate path exists
  const pathMeta = getPath(pathSlug);
  if (!pathMeta) notFound();

  return <>{children}</>;
}
