import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function getLabDir(labName: string): string {
  return path.resolve(
    new URL(".", import.meta.url).pathname,
    "..", "..", "..", "..", "labs", "docker-compose", labName,
  );
}

export function resetLab(labName: string): void {
  const labDir = getLabDir(labName);
  const composePath = path.join(labDir, "docker-compose.yml");

  if (!fs.existsSync(composePath)) {
    console.error(`\n  Error: Lab "${labName}" not found.\n`);
    process.exit(1);
  }

  console.log(`\n  Resetting lab: ${labName}...`);

  try {
    // Stop and remove containers + volumes
    execSync(`docker compose -f "${composePath}" down -v`, { stdio: "inherit" });

    // Start fresh
    execSync(`docker compose -f "${composePath}" up -d`, { stdio: "inherit" });

    console.log(`\n  Lab "${labName}" has been reset to a clean state.\n`);
  } catch {
    console.error(`\n  Failed to reset lab "${labName}".\n`);
    process.exit(1);
  }
}
