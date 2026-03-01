import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function getLabDir(labName: string): string {
  return path.resolve(
    new URL(".", import.meta.url).pathname,
    "..", "..", "..", "..", "labs", "docker-compose", labName,
  );
}

export function stopLab(labName?: string): void {
  if (!labName) {
    console.log("\n  Stopping all lab containers...\n");
    const labsRoot = path.resolve(
      new URL(".", import.meta.url).pathname,
      "..", "..", "..", "..", "labs", "docker-compose",
    );

    if (!fs.existsSync(labsRoot)) {
      console.log("  No labs directory found.");
      return;
    }

    const dirs = fs.readdirSync(labsRoot).filter((d) =>
      fs.statSync(path.join(labsRoot, d)).isDirectory(),
    );

    for (const dir of dirs) {
      const composePath = path.join(labsRoot, dir, "docker-compose.yml");
      if (fs.existsSync(composePath)) {
        try {
          execSync(`docker compose -f "${composePath}" down`, { stdio: "inherit" });
        } catch {
          // Ignore errors for labs that aren't running
        }
      }
    }

    console.log("\n  All labs stopped.\n");
    return;
  }

  const labDir = getLabDir(labName);
  const composePath = path.join(labDir, "docker-compose.yml");

  if (!fs.existsSync(composePath)) {
    console.error(`\n  Error: Lab "${labName}" not found.\n`);
    process.exit(1);
  }

  console.log(`\n  Stopping lab: ${labName}...\n`);

  try {
    execSync(`docker compose -f "${composePath}" down`, { stdio: "inherit" });
    console.log(`\n  Lab "${labName}" stopped.\n`);
  } catch {
    console.error(`\n  Failed to stop lab "${labName}".\n`);
    process.exit(1);
  }
}
