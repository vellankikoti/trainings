import * as Sentry from "@sentry/nextjs";

/**
 * Monitoring utilities for the DevOps Engineers platform.
 *
 * Provides structured logging, performance tracking, and alert helpers.
 * Integrates with Sentry for error and performance monitoring.
 */

type LogLevel = "info" | "warn" | "error";

interface LogContext {
  userId?: string;
  action?: string;
  [key: string]: unknown;
}

/**
 * Structured logger that sends to console and Sentry breadcrumbs.
 */
export function log(level: LogLevel, message: string, context?: LogContext) {
  const timestamp = new Date().toISOString();
  const entry = { timestamp, level, message, ...context };

  switch (level) {
    case "info":
      console.log(JSON.stringify(entry));
      break;
    case "warn":
      console.warn(JSON.stringify(entry));
      Sentry.addBreadcrumb({
        message,
        level: "warning",
        data: context,
      });
      break;
    case "error":
      console.error(JSON.stringify(entry));
      Sentry.addBreadcrumb({
        message,
        level: "error",
        data: context,
      });
      break;
  }
}

/**
 * Report an error to Sentry with optional context.
 */
export function reportError(error: Error, context?: LogContext) {
  log("error", error.message, context);

  Sentry.withScope((scope) => {
    if (context?.userId) {
      scope.setUser({ id: context.userId });
    }
    if (context) {
      scope.setExtras(context);
    }
    Sentry.captureException(error);
  });
}

/**
 * Track a performance metric as a custom Sentry measurement.
 */
export function trackMetric(name: string, value: number, unit: string = "millisecond") {
  Sentry.metrics.distribution(name, value, { unit });
}

/**
 * Wrap an async function with performance tracking.
 */
export async function withMonitoring<T>(
  operationName: string,
  fn: () => Promise<T>,
  context?: LogContext,
): Promise<T> {
  const start = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - start;
    trackMetric(`operation.${operationName}.duration`, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    trackMetric(`operation.${operationName}.duration`, duration);
    trackMetric(`operation.${operationName}.error`, 1, "none");

    if (error instanceof Error) {
      reportError(error, { ...context, operation: operationName });
    }
    throw error;
  }
}

/**
 * Monitor API route handler with automatic error tracking and timing.
 */
export function monitorApiRoute(routeName: string) {
  return {
    start: () => {
      const startTime = Date.now();
      return {
        end: (statusCode: number) => {
          const duration = Date.now() - startTime;
          trackMetric(`api.${routeName}.duration`, duration);
          trackMetric(`api.${routeName}.status.${statusCode}`, 1, "none");

          if (statusCode >= 500) {
            log("error", `API route ${routeName} returned ${statusCode}`, {
              duration,
              statusCode,
            });
          }
        },
      };
    },
  };
}
