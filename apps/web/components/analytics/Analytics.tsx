"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Simple privacy-friendly analytics component.
 * Tracks page views without cookies or personal data.
 *
 * To enable Vercel Analytics, install @vercel/analytics and use their component.
 * To enable Plausible, add the script tag with your domain.
 *
 * This component provides a lightweight fallback for development
 * and can be extended for any analytics provider.
 */
export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Log page views in development for debugging
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] Page view: ${pathname}`);
    }
  }, [pathname, searchParams]);

  return null;
}
