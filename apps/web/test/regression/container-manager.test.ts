/**
 * Regression tests for the lab container manager.
 * Validates TASK-120/121 acceptance criteria.
 */

import { describe, it, expect } from "vitest";
import {
  createLabSession,
  getLabSession,
  getActiveSessionForUser,
  markExerciseCompleted,
  destroyLabSession,
  LAB_CONFIGS,
  MAX_SESSION_DURATION_MS,
  INACTIVITY_TIMEOUT_MS,
} from "@/lib/labs/container-manager";

describe("Lab Configs", () => {
  it("should have configurations for all lab types", () => {
    const expectedLabs = [
      "linux-basics",
      "linux-admin",
      "shell-scripting",
      "git-basics",
      "docker-basics",
      "docker-compose",
    ];

    for (const lab of expectedLabs) {
      expect(LAB_CONFIGS[lab]).toBeDefined();
      expect(LAB_CONFIGS[lab].image).toBeTruthy();
      expect(LAB_CONFIGS[lab].memoryLimit).toBeTruthy();
      expect(LAB_CONFIGS[lab].cpuLimit).toBeTruthy();
    }
  });

  it("should give Docker labs more resources", () => {
    expect(LAB_CONFIGS["docker-basics"].memoryLimit).toBe("512m");
    expect(LAB_CONFIGS["linux-basics"].memoryLimit).toBe("256m");
  });
});

describe("Session Lifecycle", () => {
  it("should create a new session", async () => {
    const session = await createLabSession("user-test-1", "linux-basics");

    expect(session.sessionId).toBeTruthy();
    expect(session.userId).toBe("user-test-1");
    expect(session.labType).toBe("linux-basics");
    expect(session.status).toBe("running");
    expect(session.wsUrl).toBeTruthy();
    expect(session.exercisesCompleted).toEqual([]);
  });

  it("should retrieve a session by ID", async () => {
    const session = await createLabSession("user-test-2", "git-basics");
    const retrieved = getLabSession(session.sessionId);

    expect(retrieved).not.toBeNull();
    expect(retrieved!.sessionId).toBe(session.sessionId);
    expect(retrieved!.labType).toBe("git-basics");
  });

  it("should find active session for a user", async () => {
    const session = await createLabSession("user-test-3", "shell-scripting");
    const active = getActiveSessionForUser("user-test-3");

    expect(active).not.toBeNull();
    expect(active!.sessionId).toBe(session.sessionId);
  });

  it("should prevent multiple active sessions per user", async () => {
    await createLabSession("user-test-4", "linux-basics");

    await expect(
      createLabSession("user-test-4", "git-basics"),
    ).rejects.toThrow("already have an active lab session");
  });

  it("should reject unknown lab types", async () => {
    await expect(
      createLabSession("user-test-5", "nonexistent-lab"),
    ).rejects.toThrow("Unknown lab type");
  });

  it("should destroy a session", async () => {
    const session = await createLabSession("user-test-6", "linux-basics");
    const result = await destroyLabSession(session.sessionId);

    expect(result).toBe(true);

    const retrieved = getLabSession(session.sessionId);
    expect(retrieved!.status).toBe("stopped");
  });
});

describe("Exercise Validation", () => {
  it("should mark exercises as completed", async () => {
    const session = await createLabSession("user-test-7", "linux-basics");

    const result = markExerciseCompleted(session.sessionId, "ex-1");

    expect(result).toBe(true);

    const updated = getLabSession(session.sessionId);
    expect(updated!.exercisesCompleted).toContain("ex-1");
  });

  it("should not duplicate completed exercises", async () => {
    const session = await createLabSession("user-test-8", "linux-basics");

    markExerciseCompleted(session.sessionId, "ex-1");
    markExerciseCompleted(session.sessionId, "ex-1");

    const updated = getLabSession(session.sessionId);
    const count = updated!.exercisesCompleted.filter((e) => e === "ex-1").length;
    expect(count).toBe(1);
  });
});

describe("Session Timeouts", () => {
  it("should have 30 minute session duration", () => {
    expect(MAX_SESSION_DURATION_MS).toBe(30 * 60 * 1000);
  });

  it("should have 30 minute inactivity timeout", () => {
    expect(INACTIVITY_TIMEOUT_MS).toBe(30 * 60 * 1000);
  });
});
