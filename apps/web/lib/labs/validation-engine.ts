/**
 * Lab Validation Engine (B-010).
 *
 * Runs validation checks against lab sandbox environments.
 * Supports three validation types:
 *   - command: Execute a command and check output
 *   - file: Check file existence or content
 *   - service: HTTP health check
 *
 * For MVP, validation runs against Docker containers via `docker exec`.
 * For production K8s, replace with kubectl exec or API calls to sandbox pods.
 */

import { getLabDefinition, type LabExercise } from "./lab-content";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ValidationResult {
  exerciseId: string;
  passed: boolean;
  message: string;
  expectedOutput?: string;
  actualOutput?: string;
}

export interface LabValidationResult {
  labId: string;
  totalExercises: number;
  passed: number;
  failed: number;
  results: ValidationResult[];
}

// ── Container execution ──────────────────────────────────────────────────────

/**
 * Execute a command in a container and return the output.
 * In production, this would use the Docker API or kubectl exec.
 */
async function execInContainer(
  containerId: string,
  command: string,
): Promise<{ output: string; exitCode: number }> {
  // For MVP: use child_process to run docker exec
  // In production: use Docker Engine API or Kubernetes exec API
  try {
    const { execSync } = await import("child_process");
    const output = execSync(
      `docker exec ${containerId} bash -c '${command.replace(/'/g, "'\\''")}'`,
      {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
        timeout: 10_000, // 10 second timeout per command
      },
    ).trim();

    return { output, exitCode: 0 };
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; status?: number };
    return {
      output: (err.stdout ?? err.stderr ?? "").toString().trim(),
      exitCode: err.status ?? 1,
    };
  }
}

// ── Validation checks ────────────────────────────────────────────────────────

/**
 * Validate a command-type exercise.
 * Runs the command in the container and checks if output matches expected.
 */
async function validateCommand(
  containerId: string,
  exercise: LabExercise,
): Promise<ValidationResult> {
  const { validation } = exercise;

  if (!validation.command) {
    return {
      exerciseId: exercise.id,
      passed: false,
      message: "Invalid validation: missing command",
    };
  }

  const { output, exitCode } = await execInContainer(
    containerId,
    validation.command,
  );

  const expected = (validation.expected_output ?? "").trim();
  const passed = exitCode === 0 && output === expected;

  return {
    exerciseId: exercise.id,
    passed,
    message: passed
      ? "Command output matches expected result"
      : "Command output does not match expected result",
    expectedOutput: expected,
    actualOutput: output,
  };
}

/**
 * Validate a file-type exercise.
 * Checks if a file exists and optionally if it contains expected content.
 */
async function validateFile(
  containerId: string,
  exercise: LabExercise,
): Promise<ValidationResult> {
  const { validation } = exercise;

  if (!validation.path) {
    return {
      exerciseId: exercise.id,
      passed: false,
      message: "Invalid validation: missing path",
    };
  }

  if (validation.contains) {
    // Check file content
    const { output, exitCode } = await execInContainer(
      containerId,
      `cat "${validation.path}" 2>/dev/null`,
    );

    const passed = exitCode === 0 && output.includes(validation.contains);

    return {
      exerciseId: exercise.id,
      passed,
      message: passed
        ? "File contains expected content"
        : "File missing or does not contain expected content",
      expectedOutput: validation.contains,
      actualOutput: output,
    };
  }

  // Check file existence
  const { exitCode } = await execInContainer(
    containerId,
    `test -e "${validation.path}"`,
  );

  return {
    exerciseId: exercise.id,
    passed: exitCode === 0,
    message: exitCode === 0 ? "File exists" : "File not found",
  };
}

/**
 * Validate a service-type exercise.
 * Makes an HTTP request and checks the status code.
 */
async function validateService(
  containerId: string,
  exercise: LabExercise,
): Promise<ValidationResult> {
  const { validation } = exercise;

  if (!validation.port) {
    return {
      exerciseId: exercise.id,
      passed: false,
      message: "Invalid validation: missing port",
    };
  }

  const urlPath = validation.path || "/";
  const expectedStatus = validation.expected_status || 200;

  const { output, exitCode } = await execInContainer(
    containerId,
    `curl -s -o /dev/null -w '%{http_code}' http://localhost:${validation.port}${urlPath}`,
  );

  const actualStatus = parseInt(output, 10);
  const passed = exitCode === 0 && actualStatus === expectedStatus;

  return {
    exerciseId: exercise.id,
    passed,
    message: passed
      ? `Service returned HTTP ${actualStatus}`
      : `Expected HTTP ${expectedStatus}, got ${actualStatus || "no response"}`,
    expectedOutput: String(expectedStatus),
    actualOutput: String(actualStatus || "connection failed"),
  };
}

// ── Main validation ──────────────────────────────────────────────────────────

/**
 * Validate a single exercise against a running container.
 */
export async function validateExercise(
  containerId: string,
  exercise: LabExercise,
): Promise<ValidationResult> {
  switch (exercise.validation.type) {
    case "command":
      return validateCommand(containerId, exercise);
    case "file":
      return validateFile(containerId, exercise);
    case "service":
      return validateService(containerId, exercise);
    default:
      return {
        exerciseId: exercise.id,
        passed: false,
        message: `Unknown validation type: ${exercise.validation.type}`,
      };
  }
}

/**
 * Validate all exercises for a lab.
 */
export async function validateLab(
  labId: string,
  containerId: string,
): Promise<LabValidationResult> {
  const lab = getLabDefinition(labId);

  if (!lab) {
    return {
      labId,
      totalExercises: 0,
      passed: 0,
      failed: 0,
      results: [],
    };
  }

  const results: ValidationResult[] = [];

  for (const exercise of lab.exercises) {
    const result = await validateExercise(containerId, exercise);
    results.push(result);
  }

  const passed = results.filter((r) => r.passed).length;

  return {
    labId,
    totalExercises: lab.exercises.length,
    passed,
    failed: lab.exercises.length - passed,
    results,
  };
}

/**
 * Validate a specific exercise by ID for a given lab.
 */
export async function validateExerciseById(
  labId: string,
  exerciseId: string,
  containerId: string,
): Promise<ValidationResult> {
  const lab = getLabDefinition(labId);

  if (!lab) {
    return {
      exerciseId,
      passed: false,
      message: `Lab "${labId}" not found`,
    };
  }

  const exercise = lab.exercises.find((ex) => ex.id === exerciseId);

  if (!exercise) {
    return {
      exerciseId,
      passed: false,
      message: `Exercise "${exerciseId}" not found in lab "${labId}"`,
    };
  }

  return validateExercise(containerId, exercise);
}
