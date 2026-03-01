/**
 * Regression tests for the health check endpoint.
 * Validates TASK-128 acceptance criteria.
 */

import { describe, it, expect, vi } from "vitest";

// Mock Supabase admin client
vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        limit: () => Promise.resolve({ error: null, data: [] }),
      }),
    }),
  }),
}));

describe("Health Check Endpoint", () => {
  it("should return healthy status structure", async () => {
    // Import after mocks
    const { GET } = await import("@/app/api/health/route");

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("status");
    expect(data).toHaveProperty("timestamp");
    expect(data).toHaveProperty("version");
    expect(data).toHaveProperty("checks");
    expect(data.checks).toHaveProperty("database");
    expect(data.checks).toHaveProperty("auth");
  });

  it("should include response time", async () => {
    const { GET } = await import("@/app/api/health/route");

    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty("responseTime");
    expect(data.responseTime).toMatch(/^\d+ms$/);
  });

  it("should set no-cache headers", async () => {
    const { GET } = await import("@/app/api/health/route");

    const response = await GET();

    expect(response.headers.get("Cache-Control")).toBe(
      "no-cache, no-store, must-revalidate",
    );
  });
});
