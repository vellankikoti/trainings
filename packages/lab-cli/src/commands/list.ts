import fs from "fs";
import path from "path";
import yaml from "js-yaml";

interface LabConfig {
  name: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  exercises: Array<{ id: string; title: string }>;
}

function getLabsDir(): string {
  return path.resolve(
    new URL(".", import.meta.url).pathname,
    "..", "..", "..", "..", "labs", "docker-compose",
  );
}

export function listLabs(): void {
  const labsDir = getLabsDir();

  if (!fs.existsSync(labsDir)) {
    console.log("No labs directory found.");
    return;
  }

  const dirs = fs.readdirSync(labsDir).filter((d) =>
    fs.statSync(path.join(labsDir, d)).isDirectory(),
  );

  if (dirs.length === 0) {
    console.log("No labs found.");
    return;
  }

  console.log("\n  Available Labs\n");

  for (const dir of dirs) {
    const labYaml = path.join(labsDir, dir, "lab.yaml");
    if (!fs.existsSync(labYaml)) continue;

    try {
      const content = fs.readFileSync(labYaml, "utf-8");
      const config = yaml.load(content) as LabConfig;

      console.log(`  ${config.name}`);
      console.log(`    ${config.title} (${config.difficulty}, ~${config.duration} min)`);
      console.log(`    ${config.description}`);
      console.log(`    Exercises: ${config.exercises?.length ?? 0}`);
      console.log();
    } catch (e) {
      console.log(`  ${dir} (invalid lab.yaml)`);
    }
  }
}
