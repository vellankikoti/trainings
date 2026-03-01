/**
 * Regression tests for API input validation schemas.
 * Validates TASK-125 acceptance criteria (Zod input validation).
 */

import { describe, it, expect } from "vitest";
import {
  lessonProgressSchema,
  exerciseProgressSchema,
  streakSchema,
  quizStartSchema,
  quizSubmitSchema,
  certificateGenerateSchema,
  profileUpdateSchema,
  validateBody,
} from "@/lib/validations";

describe("Lesson Progress Schema", () => {
  it("should accept valid input", () => {
    const result = lessonProgressSchema.safeParse({
      pathSlug: "foundations",
      moduleSlug: "linux",
      lessonSlug: "01-intro",
      status: "completed",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid status", () => {
    const result = lessonProgressSchema.safeParse({
      pathSlug: "foundations",
      moduleSlug: "linux",
      lessonSlug: "01-intro",
      status: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("should reject slugs with special characters", () => {
    const result = lessonProgressSchema.safeParse({
      pathSlug: "foundations<script>",
      moduleSlug: "linux",
      lessonSlug: "01-intro",
      status: "completed",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty slugs", () => {
    const result = lessonProgressSchema.safeParse({
      pathSlug: "",
      moduleSlug: "linux",
      lessonSlug: "01-intro",
      status: "completed",
    });
    expect(result.success).toBe(false);
  });
});

describe("Exercise Progress Schema", () => {
  it("should accept valid input", () => {
    const result = exerciseProgressSchema.safeParse({
      lessonSlug: "01-intro",
      exerciseId: "ex-1",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing fields", () => {
    const result = exerciseProgressSchema.safeParse({
      lessonSlug: "01-intro",
    });
    expect(result.success).toBe(false);
  });
});

describe("Streak Schema", () => {
  it("should accept valid input", () => {
    const result = streakSchema.safeParse({
      activityType: "lesson",
      xpEarned: 100,
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid activity type", () => {
    const result = streakSchema.safeParse({
      activityType: "hacking",
      xpEarned: 100,
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative XP", () => {
    const result = streakSchema.safeParse({
      activityType: "lesson",
      xpEarned: -100,
    });
    expect(result.success).toBe(false);
  });

  it("should reject absurdly high XP", () => {
    const result = streakSchema.safeParse({
      activityType: "lesson",
      xpEarned: 999999,
    });
    expect(result.success).toBe(false);
  });
});

describe("Quiz Start Schema", () => {
  it("should accept valid input", () => {
    const result = quizStartSchema.safeParse({
      quizId: "foundations-linux",
      questionCount: 20,
    });
    expect(result.success).toBe(true);
  });

  it("should allow optional questionCount", () => {
    const result = quizStartSchema.safeParse({
      quizId: "foundations-linux",
    });
    expect(result.success).toBe(true);
  });
});

describe("Quiz Submit Schema", () => {
  it("should accept valid answers", () => {
    const result = quizSubmitSchema.safeParse({
      quizId: "foundations-linux",
      answers: { q1: "a", q2: "b", q3: "c" },
      timeSpentSeconds: 300,
    });
    expect(result.success).toBe(true);
  });

  it("should accept answers without time", () => {
    const result = quizSubmitSchema.safeParse({
      quizId: "foundations-linux",
      answers: { q1: "a" },
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing answers", () => {
    const result = quizSubmitSchema.safeParse({
      quizId: "foundations-linux",
    });
    expect(result.success).toBe(false);
  });
});

describe("Certificate Generate Schema", () => {
  it("should accept valid input", () => {
    const result = certificateGenerateSchema.safeParse({
      type: "module",
      title: "Linux Fundamentals",
      pathSlug: "foundations",
      moduleSlug: "linux",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid type", () => {
    const result = certificateGenerateSchema.safeParse({
      type: "fake",
      title: "Test",
    });
    expect(result.success).toBe(false);
  });
});

describe("Profile Update Schema", () => {
  it("should accept valid profile data", () => {
    const result = profileUpdateSchema.safeParse({
      display_name: "John Doe",
      bio: "DevOps enthusiast",
      username: "johndoe",
    });
    expect(result.success).toBe(true);
  });

  it("should reject username with spaces", () => {
    const result = profileUpdateSchema.safeParse({
      username: "john doe",
    });
    expect(result.success).toBe(false);
  });

  it("should reject too-long bio", () => {
    const result = profileUpdateSchema.safeParse({
      bio: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("should accept empty updates", () => {
    const result = profileUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("validateBody helper", () => {
  it("should return data on valid input", () => {
    const result = validateBody(streakSchema, {
      activityType: "lesson",
      xpEarned: 50,
    });
    expect(result.data).not.toBeNull();
    expect(result.error).toBeNull();
  });

  it("should return error on invalid input", () => {
    const result = validateBody(streakSchema, {
      activityType: "invalid",
      xpEarned: -1,
    });
    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
  });
});
