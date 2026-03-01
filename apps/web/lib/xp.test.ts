import { describe, it, expect } from "vitest";
import { XP_REWARDS } from "./xp";

describe("XP_REWARDS", () => {
  it("has correct lesson complete XP", () => {
    expect(XP_REWARDS.LESSON_COMPLETE).toBe(100);
  });

  it("has correct exercise complete XP", () => {
    expect(XP_REWARDS.EXERCISE_COMPLETE).toBe(50);
  });

  it("has correct quiz pass XP", () => {
    expect(XP_REWARDS.QUIZ_PASS).toBe(50);
  });

  it("has correct quiz perfect XP", () => {
    expect(XP_REWARDS.QUIZ_PERFECT).toBe(75);
  });

  it("has correct daily streak XP", () => {
    expect(XP_REWARDS.DAILY_STREAK).toBe(25);
  });

  it("has correct module complete XP", () => {
    expect(XP_REWARDS.MODULE_COMPLETE).toBe(200);
  });

  it("has correct path complete XP", () => {
    expect(XP_REWARDS.PATH_COMPLETE).toBe(500);
  });
});
