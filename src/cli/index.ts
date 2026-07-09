#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import { resolve } from "node:path";
import { existsSync, mkdirSync, cpSync } from "node:fs";
import { WorkflowEngine } from "../core/engine.js";
import { OpenAILlmCaller } from "../core/llm-caller.js";
import { WorkflowReader } from "../core/workflow-reader.js";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const program = new Command();

program
  .name("aiwf")
  .description("AI Workflow Engine CLI — agente + especificacao dirigida")
  .version("1.0.0");

program
  .command("init")
  .description("Inicializa .agents/ no repositorio alvo com skills e estrutura")
  .action(() => {
    const root = process.cwd();
    const agentsDir = resolve(root, ".agents");
    const skillsDir = resolve(agentsDir, "skills");
    const workflowsDir = resolve(agentsDir, "workflows");
    const artifactsDir = resolve(agentsDir, "artifacts");

    if (existsSync(skillsDir)) {
      console.log(chalk.yellow(".agents/skills/ ja existe. Pulando copia."));
    } else {
      mkdirSync(skillsDir, { recursive: true });
      const builtinSkills = resolve(PACKAGE_ROOT, "skills");
      if (existsSync(builtinSkills)) {
        cpSync(builtinSkills, skillsDir, { recursive: true });
        console.log(chalk.green(`skills copiadas para .agents/skills/`));
      }
    }

    for (const dir of [workflowsDir, artifactsDir]) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(chalk.green(`criado ${dir.replace(root, ".")}`));
      }
    }

    console.log(chalk.green(".agents/ pronto"));
  });

program
  .command("run")
  .argument("<story-id>", "identificador da historia, ex: STORY-001")
  .option("--workflow-dir <path>", "diretorio base dos workflows", ".agents/workflows")
  .option("--artifacts-dir <path>", "diretorio base dos artefatos", ".agents/artifacts")
  .option("--dry-run", "simular execucao sem chamar LLM")
  .option("--model <name>", "modelo OpenAI a usar", "gpt-4o-mini")
  .option("--manual", "modo agente: renderiza prompt e aguarda artifact externo")
  .action(async (storyId: string, options: { workflowDir: string; artifactsDir: string; dryRun?: boolean; model: string; manual?: boolean }) => {
    try {
      const projectRoot = process.cwd();
      const workflowPath = resolve(projectRoot, options.workflowDir, storyId, "workflow.yaml");
      if (!existsSync(workflowPath)) {
        console.error(chalk.red(`workflow nao encontrado: ${workflowPath}`));
        process.exit(1);
      }

      const reader = new WorkflowReader();
      const workflow = await reader.load(workflowPath);
      const engine = new WorkflowEngine();
      const isManual = Boolean(options.manual);

      if (!isManual && !options.dryRun) {
        console.log(chalk.cyan(`model: ${options.model}`));
      }
      console.log(chalk.cyan(`workflow: ${workflow.id}`));
      console.log(chalk.cyan(`mode: ${isManual ? "manual (agente)" : options.dryRun ? "dry-run" : "auto"}`));

      const llmCaller = (options.dryRun || isManual) ? undefined : new OpenAILlmCaller(options.model);

      await engine.run({
        projectRoot,
        workflow,
        dryRun: Boolean(options.dryRun),
        manual: isManual,
        llmCaller,
        onLog: (message) => console.log(chalk.gray(`• ${message}`))
      });

      if (!isManual) {
        console.log(chalk.green("done"));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`error: ${message}`));
      process.exitCode = 1;
    }
  });

program
  .command("resume")
  .argument("<story-id>", "identificador da historia, ex: STORY-001")
  .option("--workflow-dir <path>", "diretorio base dos workflows", ".agents/workflows")
  .option("--artifacts-dir <path>", "diretorio base dos artefatos", ".agents/artifacts")
  .option("--dry-run", "simular execucao sem chamar LLM")
  .option("--model <name>", "modelo OpenAI a usar", "gpt-4o-mini")
  .option("--manual", "modo agente: renderiza prompt e aguarda artifact externo")
  .action(async (storyId: string, options: { workflowDir: string; artifactsDir: string; dryRun?: boolean; model: string; manual?: boolean }) => {
    try {
      const projectRoot = process.cwd();
      const workflowPath = resolve(projectRoot, options.workflowDir, storyId, "workflow.yaml");
      if (!existsSync(workflowPath)) {
        console.error(chalk.red(`workflow nao encontrado: ${workflowPath}`));
        process.exit(1);
      }

      const reader = new WorkflowReader();
      const workflow = await reader.load(workflowPath);
      const engine = new WorkflowEngine();
      const isManual = Boolean(options.manual);

      if (!isManual && !options.dryRun) {
        console.log(chalk.cyan(`model: ${options.model}`));
      }
      console.log(chalk.cyan(`resuming: ${workflow.id}`));
      console.log(chalk.cyan(`mode: ${isManual ? "manual (agente)" : options.dryRun ? "dry-run" : "auto"}`));

      const llmCaller = (options.dryRun || isManual) ? undefined : new OpenAILlmCaller(options.model);

      await engine.run({
        projectRoot,
        workflow,
        dryRun: Boolean(options.dryRun),
        manual: isManual,
        llmCaller,
        onLog: (message) => console.log(chalk.gray(`• ${message}`))
      });

      if (!isManual) {
        console.log(chalk.green("done"));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`error: ${message}`));
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv);
