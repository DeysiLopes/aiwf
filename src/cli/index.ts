#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import { resolve } from "node:path";
import { WorkflowEngine } from "../core/engine.js";
import { OpenAILlmCaller } from "../core/llm-caller.js";
import { WorkflowReader } from "../core/workflow-reader.js";

const program = new Command();

program
  .name("aiwf")
  .description("AI Workflow Engine CLI")
  .version("1.0.0");

program
  .command("run")
  .argument("<story-id>", "story identifier, ex: STORY-001")
  .option("--workflow-dir <path>", "base directory for workflow files", "examples")
  .option("--dry-run", "simulate execution and generate artifacts without calling LLM")
  .option("--model <name>", "OpenAI model to use", "gpt-4o-mini")
  .action(async (storyId: string, options: { workflowDir: string; dryRun?: boolean; model: string }) => {
    try {
      const projectRoot = process.cwd();
      const workflowPath = resolve(projectRoot, options.workflowDir, storyId, "workflow.yaml");
      const reader = new WorkflowReader();
      const workflow = await reader.load(workflowPath);
      const engine = new WorkflowEngine();

      const llmCaller = options.dryRun ? undefined : new OpenAILlmCaller(options.model);
      console.log(chalk.cyan(`workflow: ${workflow.id}`));
      console.log(chalk.cyan(`dry-run: ${options.dryRun ? "yes" : "no"}`));

      await engine.run({
        projectRoot,
        workflow,
        dryRun: Boolean(options.dryRun),
        llmCaller,
        onLog: (message) => console.log(chalk.gray(`• ${message}`))
      });

      console.log(chalk.green("done"));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`error: ${message}`));
      process.exitCode = 1;
    }
  });

program
  .command("resume")
  .argument("<story-id>", "story identifier, ex: STORY-001")
  .option("--workflow-dir <path>", "base directory for workflow files", "examples")
  .option("--dry-run", "simulate execution and generate artifacts without calling LLM")
  .option("--model <name>", "OpenAI model to use", "gpt-4o-mini")
  .action(async (storyId: string, options: { workflowDir: string; dryRun?: boolean; model: string }) => {
    try {
      const projectRoot = process.cwd();
      const workflowPath = resolve(projectRoot, options.workflowDir, storyId, "workflow.yaml");
      const reader = new WorkflowReader();
      const workflow = await reader.load(workflowPath);
      const engine = new WorkflowEngine();

      const llmCaller = options.dryRun ? undefined : new OpenAILlmCaller(options.model);
      console.log(chalk.cyan(`resuming workflow: ${workflow.id}`));
      console.log(chalk.cyan(`dry-run: ${options.dryRun ? "yes" : "no"}`));

      await engine.run({
        projectRoot,
        workflow,
        dryRun: Boolean(options.dryRun),
        llmCaller,
        onLog: (message) => console.log(chalk.gray(`• ${message}`))
      });

      console.log(chalk.green("done"));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`error: ${message}`));
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv);
