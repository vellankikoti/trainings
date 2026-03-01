import { describe, it, expect } from "vitest";
import { calculateLevel, xpToNextLevel, levelProgress, LEVELS } from "./levels";

describe("calculateLevel", () => {
  it("returns Newcomer for 0 XP", () => {
    expect(calculateLevel(0).title).toBe("Newcomer");
    expect(calculateLevel(0).level).toBe(1);
  });

  it("returns Apprentice for 500 XP", () => {
    expect(calculateLevel(500).title).toBe("Apprentice");
    expect(calculateLevel(500).level).toBe(2);
  });

  it("returns Distinguished Engineer for 65000+ XP", () => {
    expect(calculateLevel(65000).title).toBe("Distinguished Engineer");
    expect(calculateLevel(65000).level).toBe(10);
    expect(calculateLevel(100000).level).toBe(10);
  });

  it("returns correct level at boundaries", () => {
    expect(calculateLevel(499).level).toBe(1);
    expect(calculateLevel(500).level).toBe(2);
    expect(calculateLevel(1499).level).toBe(2);
    expect(calculateLevel(1500).level).toBe(3);
  });
});

describe("xpToNextLevel", () => {
  it("returns correct XP needed from 0", () => {
    expect(xpToNextLevel(0)).toBe(500);
  });

  it("returns correct XP needed mid-level", () => {
    expect(xpToNextLevel(250)).toBe(250);
  });

  it("returns 0 at max level", () => {
    expect(xpToNextLevel(65000)).toBe(0);
  });
});

describe("levelProgress", () => {
  it("returns 0 at start of level", () => {
    expect(levelProgress(0)).toBe(0);
  });

  it("returns ~50% at midpoint", () => {
    expect(levelProgress(250)).toBe(50);
  });

  it("returns 100 at max level", () => {
    expect(levelProgress(65000)).toBe(100);
  });
});

describe("LEVELS", () => {
  it("has 10 levels", () => {
    expect(LEVELS).toHaveLength(10);
  });

  it("levels are in ascending order", () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].minXP).toBeGreaterThan(LEVELS[i - 1].minXP);
    }
  });
});
