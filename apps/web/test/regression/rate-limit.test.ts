/**
 * Regression tests for the rate limiting system.
 * Validates TASK-126 acceptance criteria.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

describe("Rate Limiter", () => {
  // Use unique identifiers per test to avoid state leakage
  let testId = 0;
  beforeEach(() => {
    testId++;
  });

  it("should allow requests within the limit", async () => {
    const id = `test-allow-${testId}`;
    const config = { limit: 5, windowSeconds: 60 };

    const result = await rateLimit(id, config);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);
  });

  it("should block requests exceeding the limit", async () => {
    const id = `test-block-${testId}`;
    const config = { limit: 3, windowSeconds: 60 };

    // Use up all tokens
    await rateLimit(id, config);
    await rateLimit(id, config);
    await rateLimit(id, config);

    // Fourth request should be blocked
    const result = await rateLimit(id, config);

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should track remaining tokens correctly", async () => {
    const id = `test-remaining-${testId}`;
    const config = { limit: 5, windowSeconds: 60 };

    const r1 = await rateLimit(id, config);
    const r2 = await rateLimit(id, config);
    const r3 = await rateLimit(id, config);

    expect(r1.remaining).toBe(4);
    expect(r2.remaining).toBe(3);
    expect(r3.remaining).toBe(2);
  });

  it("should use different limits per identifier", async () => {
    const idA = `test-separate-a-${testId}`;
    const idB = `test-separate-b-${testId}`;
    const config = { limit: 2, windowSeconds: 60 };

    await rateLimit(idA, config);
    await rateLimit(idA, config);

    // A should be blocked, B should be allowed
    const resultA = await rateLimit(idA, config);
    const resultB = await rateLimit(idB, config);

    expect(resultA.success).toBe(false);
    expect(resultB.success).toBe(true);
  });

  it("should have correct predefined limits", () => {
    expect(RATE_LIMITS.quizSubmit.limit).toBe(10);
    expect(RATE_LIMITS.quizSubmit.windowSeconds).toBe(60);

    expect(RATE_LIMITS.progress.limit).toBe(30);
    expect(RATE_LIMITS.progress.windowSeconds).toBe(60);

    expect(RATE_LIMITS.labSession.limit).toBe(5);
    expect(RATE_LIMITS.labSession.windowSeconds).toBe(3600);

    expect(RATE_LIMITS.certificateGenerate.limit).toBe(3);
    expect(RATE_LIMITS.certificateGenerate.windowSeconds).toBe(3600);

    expect(RATE_LIMITS.checkout.limit).toBe(5);
    expect(RATE_LIMITS.checkout.windowSeconds).toBe(3600);
  });

  it("should return proper 429 response", () => {
    const blockedResult = {
      success: false,
      limit: 10,
      remaining: 0,
      resetAt: Date.now() + 60000,
    };

    const response = rateLimitResponse(blockedResult);

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBeTruthy();
    expect(response.headers.get("X-RateLimit-Limit")).toBe("10");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
  });
});
