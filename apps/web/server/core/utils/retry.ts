/**
 * Exponential Backoff Retry
 *
 * Retries a function with exponential backoff and jitter.
 * Used for transient failures (database timeouts, Redis blips, external APIs).
 *
 * Usage:
 *   const result = await retry(() => externalApi.call(), {
 *     maxAttempts: 3,
 *     baseDelayMs: 100,
 *   });
 */

import { logger } from "../observability/logger";

const log = logger.child({ module: "retry" });

export interface RetryOptions {
  /** Maximum number of attempts (including the first one) */
  maxAttempts?: number;

  /** Base delay in ms before first retry (doubles each attempt) */
  baseDelayMs?: number;

  /** Maximum delay in ms (caps the exponential growth) */
  maxDelayMs?: number;

  /** Whether to add random jitter to delays (prevents thundering herd) */
  jitter?: boolean;

  /** Optional label for logging */
  label?: string;

  /** Optional predicate — retry only if this returns true for the error */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 100,
  maxDelayMs: 10000,
  jitter: true,
  label: "operation",
  shouldRetry: () => true,
};

export async function retry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === opts.maxAttempts) {
        break;
      }

      if (!opts.shouldRetry(error, attempt)) {
        break;
      }

      const delay = calculateDelay(attempt, opts);

      log.warn(`${opts.label} failed, retrying`, {
        attempt,
        maxAttempts: opts.maxAttempts,
        delayMs: delay,
        error: error instanceof Error ? error.message : String(error),
      });

      await sleep(delay);
    }
  }

  throw lastError;
}

function calculateDelay(attempt: number, opts: Required<RetryOptions>): number {
  // Exponential: baseDelay * 2^(attempt-1)
  const exponentialDelay = opts.baseDelayMs * Math.pow(2, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, opts.maxDelayMs);

  if (!opts.jitter) return cappedDelay;

  // Full jitter: random value between 0 and cappedDelay
  return Math.floor(Math.random() * cappedDelay);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
