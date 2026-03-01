import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

interface Exercise {
  id: string;
  title: string;
  description: string;
  validation: {
    type: "command" | "file" | "service";
    command?: string;
    expected_output?: string;
    path?: string;
    contains?: string;
    port?: number;
    expected_status?: number;
  };
}

interface LabConfig {
  name: string;
  title: string;
  exercises: Exercise[];
  environment: { compose_file: string };
}

function getLabDir(labName: string): string {
  return path.resolve(
    new URL(".", import.meta.url).pathname,
    "..", "..", "..", "..", "labs", "docker-compose", labName,
  );
}

function getContainerName(labName: string): string {
  return `devops-${labName}-lab`;
}

export function validateLab(labName?: string): void {
  if (!labName) {
    console.error("\n  Usage: devops-lab validate <lab-name>\n");
    process.exit(1);
  }

  const labDir = getLabDir(labName);
  const labYaml = path.join(labDir, "lab.yaml");

  if (!fs.existsSync(labYaml)) {
    console.error(`\n  Error: Lab "${labName}" not found.\n`);
    process.exit(1);
  }

  const content = fs.readFileSync(labYaml, "utf-8");
  const config = yaml.load(content) as LabConfig;
  const containerName = getContainerName(labName);

  // Check if container is running
  try {
    const result = execSync(`docker inspect -f '{{.State.Running}}' ${containerName}`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    if (result !== "true") {
      console.error(`\n  Error: Lab "${labName}" is not running. Start it first with: devops-lab start ${labName}\n`);
      process.exit(1);
    }
  } catch {
    console.error(`\n  Error: Lab "${labName}" is not running. Start it first with: devops-lab start ${labName}\n`);
    process.exit(1);
  }

  console.log(`\n  Validating exercises for: ${config.title}\n`);

  let passed = 0;
  let failed = 0;

  for (const exercise of config.exercises) {
    const result = validateExercise(containerName, exercise);
    if (result) {
      console.log(`  [PASS] ${exercise.title}`);
      passed++;
    } else {
      console.log(`  [FAIL] ${exercise.title}`);
      console.log(`         ${exercise.description}`);
      failed++;
    }
  }

  console.log(`\n  Results: ${passed} passed, ${failed} failed out of ${config.exercises.length} exercises\n`);

  if (failed === 0) {
    console.log("  All exercises complete! Great job!\n");
  }
}

function validateExercise(containerName: string, exercise: Exercise): boolean {
  const { validation } = exercise;

  try {
    switch (validation.type) {
      case "command": {
        const output = execSync(
          `docker exec ${containerName} ${validation.command}`,
          { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] },
        ).trim();
        return output === validation.expected_output?.trim();
      }

      case "file": {
        const checkCmd = validation.contains
          ? `cat "${validation.path}" 2>/dev/null`
          : `test -e "${validation.path}" && echo "exists"`;

        const output = execSync(
          `docker exec ${containerName} bash -c '${checkCmd}'`,
          { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] },
        ).trim();

        if (validation.contains) {
          return output.includes(validation.contains);
        }
        return output === "exists";
      }

      case "service": {
        const cmd = `curl -s -o /dev/null -w '%{http_code}' http://localhost:${validation.port}${validation.path || "/"}`;
        const statusCode = execSync(
          `docker exec ${containerName} bash -c "${cmd}"`,
          { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] },
        ).trim();
        return parseInt(statusCode, 10) === (validation.expected_status || 200);
      }

      default:
        return false;
    }
  } catch {
    return false;
  }
}
