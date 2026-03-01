import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function getLabDir(labName: string): string {
  return path.resolve(
    new URL(".", import.meta.url).pathname,
    "..", "..", "..", "..", "labs", "docker-compose", labName,
  );
}

function checkDocker(): boolean {
  try {
    execSync("docker info", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function startLab(labName: string): void {
  if (!checkDocker()) {
    console.error("\n  Error: Docker is not installed or not running.");
    console.error("  Please install Docker Desktop: https://www.docker.com/products/docker-desktop/\n");
    process.exit(1);
  }

  const labDir = getLabDir(labName);
  const composePath = path.join(labDir, "docker-compose.yml");

  if (!fs.existsSync(composePath)) {
    console.error(`\n  Error: Lab "${labName}" not found.`);
    console.error("  Run 'devops-lab list' to see available labs.\n");
    process.exit(1);
  }

  console.log(`\n  Starting lab: ${labName}...`);
  console.log("  Pulling images and starting containers...\n");

  try {
    execSync(`docker compose -f "${composePath}" up -d`, {
      stdio: "inherit",
    });
    console.log(`\n  Lab "${labName}" is running!`);
    console.log(`  Connect: docker exec -it devops-${labName.replace(/-/g, "-")}-lab bash`);
    console.log(`  Validate: devops-lab validate ${labName}`);
    console.log(`  Stop: devops-lab stop ${labName}\n`);
  } catch (e) {
    console.error(`\n  Failed to start lab "${labName}".`);
    process.exit(1);
  }
}
