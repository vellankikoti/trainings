"use client";

import { useEffect } from "react";
import { tracker } from "@/lib/tracking/event-sdk";

/**
 * Initializes the client-side event tracker.
 * Place this in the root layout so tracking is active on all pages.
 */
export function TrackingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    tracker.init();
    return () => tracker.destroy();
  }, []);

  return <>{children}</>;
}
