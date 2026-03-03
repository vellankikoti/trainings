/**
 * Structured JSON Logger
 *
 * Production-grade structured logging with:
 * - JSON output (machine-parseable for log aggregation)
 * - Log levels with numeric severity
 * - Request context propagation (traceId, userId)
 * - Child loggers for module-scoped context
 * - Sensitive field redaction
 * - Performance timing helpers
 *
 * Usage:
 *   import { logger } from '@/server/core/observability/logger';
 *
 *   logger.info('Lesson completed', { lessonSlug: 'linux/basics', xp: 25 });
 *
 *   const child = logger.child({ module: 'progress', userId: 'usr_123' });
 *   child.info('XP awarded');
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  severity: number;
  message: string;
  service: string;
  [key: string]: unknown;
}

interface LogContext {
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SEVERITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50,
};

const REDACTED_FIELDS = new Set([
  "password",
  "secret",
  "token",
  "apiKey",
  "api_key",
  "authorization",
  "cookie",
  "credit_card",
  "ssn",
  "serviceRoleKey",
  "service_role_key",
  "secretKey",
  "secret_key",
  "webhookSecret",
  "webhook_secret",
]);

const SERVICE_NAME = "career-os-api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMinLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL as LogLevel | undefined;
  if (envLevel && envLevel in SEVERITY) {
    return envLevel;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function redactSensitiveFields(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(redactSensitiveFields);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (REDACTED_FIELDS.has(key)) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      result[key] = redactSensitiveFields(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function serializeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
      ...(err as unknown as Record<string, unknown>),
    };
  }
  return { raw: String(err) };
}

// ---------------------------------------------------------------------------
// Logger class
// ---------------------------------------------------------------------------

export class Logger {
  private readonly minSeverity: number;
  private readonly context: LogContext;

  constructor(context: LogContext = {}, minLevel?: LogLevel, parentSeverity?: number) {
    this.minSeverity = parentSeverity ?? SEVERITY[minLevel ?? getMinLevel()];
    this.context = context;
  }

  /**
   * Create a child logger that inherits parent context
   * and adds additional fields to every log entry.
   */
  child(context: LogContext): Logger {
    const merged = { ...this.context, ...context };
    return new Logger(merged, undefined, this.minSeverity);
  }

  debug(message: string, data?: LogContext): void {
    this.log("debug", message, data);
  }

  info(message: string, data?: LogContext): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: LogContext): void {
    this.log("warn", message, data);
  }

  error(message: string, error?: unknown, data?: LogContext): void {
    const errorData = error ? { error: serializeError(error) } : {};
    this.log("error", message, { ...errorData, ...data });
  }

  fatal(message: string, error?: unknown, data?: LogContext): void {
    const errorData = error ? { error: serializeError(error) } : {};
    this.log("fatal", message, { ...errorData, ...data });
  }

  /**
   * Measure the duration of an async operation.
   * Returns the result and logs the duration.
   *
   * Usage:
   *   const result = await logger.time('db_query', async () => db.query(...));
   */
  async time<T>(
    operationName: string,
    fn: () => Promise<T>,
    data?: LogContext
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const durationMs = Math.round(performance.now() - start);
      this.info(`${operationName} completed`, {
        ...data,
        operation: operationName,
        durationMs,
      });
      return result;
    } catch (err) {
      const durationMs = Math.round(performance.now() - start);
      this.error(`${operationName} failed`, err, {
        ...data,
        operation: operationName,
        durationMs,
      });
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  private log(level: LogLevel, message: string, data?: LogContext): void {
    const severity = SEVERITY[level];
    if (severity < this.minSeverity) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      severity,
      message,
      service: SERVICE_NAME,
      ...this.context,
      ...(redactSensitiveFields(data) as LogContext),
    };

    const serialized = JSON.stringify(entry);

    // Route to appropriate console method for compatibility with
    // log aggregation tools that filter on stderr vs stdout.
    if (severity >= SEVERITY.error) {
      // eslint-disable-next-line no-console
      console.error(serialized);
    } else if (severity >= SEVERITY.warn) {
      // eslint-disable-next-line no-console
      console.warn(serialized);
    } else {
      // eslint-disable-next-line no-console
      console.log(serialized);
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton — import this for application-wide logging
// ---------------------------------------------------------------------------

export const logger = new Logger();
