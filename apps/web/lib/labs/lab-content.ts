/**
 * Lab content loader.
 *
 * Reads lab.yaml definitions from the labs/ directory.
 * Used by the lab page to render exercise instructions.
 */

import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// ── Types ────────────────────────────────────────────────────────────────────

export interface LabExercise {
  id: string;
  title: string;
  description: string;
  hints: string[];
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

export interface LabDefinition {
  name: string;
  title: string;
  description: string;
  lesson_ref: string;
  difficulty: "easy" | "medium" | "hard";
  duration: number;
  environment: {
    type: string;
    compose_file: string;
  };
  exercises: LabExercise[];
}

// ── Loader ───────────────────────────────────────────────────────────────────

const LABS_DIR = path.join(process.cwd(), "..", "..", "labs", "docker-compose");

/**
 * Get a lab definition by its ID (directory name).
 */
export function getLabDefinition(labId: string): LabDefinition | null {
  const labPath = path.join(LABS_DIR, labId, "lab.yaml");

  if (!fs.existsSync(labPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(labPath, "utf-8");
    return yaml.load(content) as LabDefinition;
  } catch {
    return null;
  }
}

/**
 * List all available labs.
 */
export function listLabs(): LabDefinition[] {
  if (!fs.existsSync(LABS_DIR)) {
    return [];
  }

  const dirs = fs.readdirSync(LABS_DIR, { withFileTypes: true });
  const labs: LabDefinition[] = [];

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;

    const lab = getLabDefinition(dir.name);
    if (lab) {
      labs.push(lab);
    }
  }

  return labs;
}
