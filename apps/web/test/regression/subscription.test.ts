/**
 * Regression tests for the subscription/feature gating system.
 * Validates TASK-123 acceptance criteria.
 */

import { describe, it, expect } from "vitest";
import { hasFeatureAccess, FEATURES, type Feature } from "@/lib/subscription";

describe("Feature Access", () => {
  it("should give free users access to all lessons", () => {
    expect(hasFeatureAccess("free", "allLessons")).toBe(true);
  });

  it("should give free users access to local labs", () => {
    expect(hasFeatureAccess("free", "localLabs")).toBe(true);
  });

  it("should give free users access to inline quizzes", () => {
    expect(hasFeatureAccess("free", "inlineQuizzes")).toBe(true);
  });

  it("should block free users from cloud labs", () => {
    expect(hasFeatureAccess("free", "cloudLabs")).toBe(false);
  });

  it("should block free users from certificates", () => {
    expect(hasFeatureAccess("free", "certificates")).toBe(false);
  });

  it("should block free users from assessments", () => {
    expect(hasFeatureAccess("free", "moduleAssessments")).toBe(false);
  });

  it("should block free users from PDF downloads", () => {
    expect(hasFeatureAccess("free", "pdfDownloads")).toBe(false);
  });

  it("should give premium users access to cloud labs", () => {
    expect(hasFeatureAccess("premium", "cloudLabs")).toBe(true);
  });

  it("should give premium users access to certificates", () => {
    expect(hasFeatureAccess("premium", "certificates")).toBe(true);
  });

  it("should block premium users from team features", () => {
    expect(hasFeatureAccess("premium", "teamDashboard")).toBe(false);
  });

  it("should give team users access to everything", () => {
    const features = Object.keys(FEATURES) as Feature[];
    for (const feature of features) {
      expect(hasFeatureAccess("team", feature)).toBe(true);
    }
  });
});

describe("Feature Definitions", () => {
  it("should have all expected features defined", () => {
    const expectedFeatures: Feature[] = [
      "allLessons",
      "localLabs",
      "inlineQuizzes",
      "basicProgress",
      "cloudLabs",
      "certificates",
      "moduleAssessments",
      "pdfDownloads",
      "prioritySupport",
      "teamDashboard",
      "teamAnalytics",
      "ssoIntegration",
    ];

    for (const feature of expectedFeatures) {
      expect(FEATURES).toHaveProperty(feature);
    }
  });

  it("should have free tier features available to all plans", () => {
    const freeFeatures: Feature[] = [
      "allLessons",
      "localLabs",
      "inlineQuizzes",
      "basicProgress",
    ];

    for (const feature of freeFeatures) {
      expect(hasFeatureAccess("free", feature)).toBe(true);
      expect(hasFeatureAccess("premium", feature)).toBe(true);
      expect(hasFeatureAccess("team", feature)).toBe(true);
    }
  });
});
