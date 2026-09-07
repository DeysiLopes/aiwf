#!/usr/bin/env node

import { config } from "dotenv";
import { homedir } from "node:os";

const zenEnvPath = resolve(homedir(), ".config", "opencode", ".env");
if (existsSync(zenEnvPath)) {
  config({ path: zenEnvPath });
}

import chalk from "chalk";
import { Command } from "commander";
import { resolve, dirname } from "node:path";
import { existsSync, mkdirSync, cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { WorkflowEngine } from "../core/engine.js";
import { OpenAILlmCaller, type AiProvider } from "../core/llm-caller.js";
import { WorkflowReader } from "../core/workflow-reader.js";
import { SkillLoader } from "../core/skill-loader.js";
import { TemplateEngine } from "../core/template-engine.js";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const program = new Command();

function resolveWorkflowPath(projectRoot: string, workflowDir: string, storyId: string): string {
  const candidates = [
    resolve(projectRoot, workflowDir, storyId, "workflow.yaml"),
    resolve(projectRoot, "examples", storyId, "workflow.yaml"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

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

    const exampleDir = resolve(workflowsDir, "EXAMPLE-001");
    const exampleFile = resolve(exampleDir, "workflow.yaml");
    if (!existsSync(exampleFile)) {
      mkdirSync(exampleDir, { recursive: true });
      const builtinWorkflows = resolve(PACKAGE_ROOT, "workflows", "EXAMPLE-001", "workflow.yaml");
      if (existsSync(builtinWorkflows)) {
        cpSync(builtinWorkflows, exampleFile);
        console.log(chalk.green(`criado .agents/workflows/EXAMPLE-001/workflow.yaml (exemplo)`));
      }
    }

    for (const dir of [artifactsDir]) {
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
  .option("--model <name>", "modelo a usar", "big-pickle")
  .option("--provider <provider>", "provedor (openai|zen)", "zen")
  .option("--manual", "modo agente: renderiza prompt e aguarda artifact externo")
  .action(async (storyId: string, options: { workflowDir: string; artifactsDir: string; dryRun?: boolean; model: string; provider: AiProvider; manual?: boolean }) => {
    try {
      const projectRoot = process.cwd();
      const workflowPath = resolveWorkflowPath(projectRoot, options.workflowDir, storyId);
      if (!existsSync(workflowPath)) {
        console.error(chalk.red(`workflow nao encontrado: ${workflowPath}`));
        console.error(chalk.yellow(`dica: use "aiwf create ${storyId}" ou "aiwf run ${storyId} --workflow-dir examples"`));
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

      const llmCaller = (options.dryRun || isManual) ? undefined : new OpenAILlmCaller(options.model, options.provider);

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
  .option("--model <name>", "modelo a usar", "big-pickle")
  .option("--provider <provider>", "provedor (openai|zen)", "zen")
  .option("--manual", "modo agente: renderiza prompt e aguarda artifact externo")
  .action(async (storyId: string, options: { workflowDir: string; artifactsDir: string; dryRun?: boolean; model: string; provider: AiProvider; manual?: boolean }) => {
    try {
      const projectRoot = process.cwd();
      const workflowPath = resolveWorkflowPath(projectRoot, options.workflowDir, storyId);
      if (!existsSync(workflowPath)) {
        console.error(chalk.red(`workflow nao encontrado: ${workflowPath}`));
        console.error(chalk.yellow(`dica: use "aiwf create ${storyId}" ou "aiwf resume ${storyId} --workflow-dir examples"`));
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

      const llmCaller = (options.dryRun || isManual) ? undefined : new OpenAILlmCaller(options.model, options.provider);

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
  .command("create")
  .description("Gera workflow.yaml para uma historia usando LLM")
  .argument("<story-id>", "identificador da historia, ex: STORY-001")
  .option("--title <title>", "titulo da historia")
  .option("--description <desc>", "descricao da historia")
  .option("--acceptance <criteria>", "criterios de aceitacao")
  .option("--tech-stack <stack>", "stack tecnologica", "Node.js 20+")
  .option("--model <name>", "modelo a usar", "big-pickle")
  .option("--provider <provider>", "provedor (openai|zen)", "zen")
  .option("--workflow-dir <path>", "diretorio base dos workflows", ".agents/workflows")
  .action(async (storyId: string, options: {
    title?: string;
    description?: string;
    acceptance?: string;
    techStack?: string;
    model: string;
    provider: AiProvider;
    workflowDir: string;
  }) => {
    try {
      const projectRoot = process.cwd();
      const workflowPath = resolve(projectRoot, options.workflowDir, storyId, "workflow.yaml");

      if (existsSync(workflowPath)) {
        console.log(chalk.yellow(`workflow ja existe: ${workflowPath}`));
        process.exit(0);
      }

      const title = options.title ?? storyId;
      const description = options.description ?? `Historia ${storyId}`;
      const acceptance = options.acceptance ?? "- A ser definido";
      const techStack = options.techStack ?? "Node.js 20+";

      const skillLoader = new SkillLoader();
      const templateEngine = new TemplateEngine();

      const builtinSkillPath = resolve(PACKAGE_ROOT, "skills", "generate-workflow.md");
      if (!existsSync(builtinSkillPath)) {
        console.error(chalk.red(`skill generate-workflow nao encontrada em: ${builtinSkillPath}`));
        process.exit(1);
      }

      const skillTemplate = await skillLoader.load(builtinSkillPath);
      const renderedPrompt = templateEngine.render(skillTemplate, {
        workflow: { id: storyId, name: title, description },
        tdd: false,
        artifacts: {},
        input: {
          story_title: title,
          story_description: description,
          acceptance_criteria: acceptance,
          tech_stack: techStack
        }
      });

      console.log(chalk.cyan(`model: ${options.model}`));
      console.log(chalk.cyan(`provider: ${options.provider}`));
      console.log(chalk.cyan(`gerando workflow para: ${storyId}`));

      const llm = new OpenAILlmCaller(options.model, options.provider);
      const workflowYaml = await llm.call(renderedPrompt);

      const dir = resolve(projectRoot, options.workflowDir, storyId);
      mkdirSync(dir, { recursive: true });
      const writeFile = await import("node:fs/promises").then(m => m.writeFile);
      await writeFile(workflowPath, workflowYaml, "utf-8");

      console.log(chalk.green(`workflow criado: ${workflowPath}`));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`error: ${message}`));
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv);
