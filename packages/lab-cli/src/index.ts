#!/usr/bin/env node

import { Command } from "commander";
import { listLabs } from "./commands/list.js";
import { startLab } from "./commands/start.js";
import { stopLab } from "./commands/stop.js";
import { resetLab } from "./commands/reset.js";
import { validateLab } from "./commands/validate.js";

const program = new Command();

program
  .name("devops-lab")
  .description("DEVOPS ENGINEERS — Lab Environment CLI")
  .version("1.0.0");

program
  .command("list")
  .description("List all available labs")
  .action(listLabs);

program
  .command("start <lab-name>")
  .description("Start a lab environment")
  .action(startLab);

program
  .command("stop [lab-name]")
  .description("Stop lab containers")
  .action(stopLab);

program
  .command("reset <lab-name>")
  .description("Reset a lab environment (stop, remove, restart)")
  .action(resetLab);

program
  .command("validate [lab-name]")
  .description("Validate exercise completion in a running lab")
  .action(validateLab);

program.parse();
