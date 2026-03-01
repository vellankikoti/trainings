import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if the DSN is configured
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Session replay (optional, requires additional package)
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

    // Environment
    environment: process.env.NODE_ENV,

    // Only send errors in production
    enabled: process.env.NODE_ENV === "production",

    // Filter out noisy errors
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      // Network errors
      "NetworkError",
      "Failed to fetch",
      "Load failed",
      // Clerk auth transitions
      "clerk",
    ],
  });
}
