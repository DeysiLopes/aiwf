import { basename, extname, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { StateManager } from "./state-manager.js";
import type { ParallelSubStep, WorkflowDefinition, WorkflowStep } from "../types/workflow.types.js";
import { ArtifactManager } from "./artifact-manager.js";
import type { LlmCaller } from "./llm-caller.js";
import { SkillLoader } from "./skill-loader.js";
import { TemplateEngine } from "./template-engine.js";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export interface EngineOptions {
  projectRoot: string;
  workflow: WorkflowDefinition;
  dryRun: boolean;
  manual?: boolean;
  llmCaller?: LlmCaller;
  onLog?: (message: string) => void;
}

export class WorkflowEngine {
  private readonly artifactManager = new ArtifactManager();
  private readonly skillLoader = new SkillLoader();
  private readonly templateEngine = new TemplateEngine();

  async run(options: EngineOptions): Promise<void> {
    const stateManager = new StateManager(options.projectRoot);
    const persisted = await stateManager.loadState(options.workflow.id);
    const startIndex = persisted?.nextStepIndex ?? 0;

    if (options.workflow.tdd) {
      this.reorderForTdd(options.workflow.steps);
    }

    const artifactsRoot = resolve(options.projectRoot, options.workflow.artifacts_dir);
    const artifactsContext: Record<string, string> = {};

    // If resuming, try to load existing artifacts into context for earlier steps
    for (let i = 0; i < startIndex; i++) {
      const step = options.workflow.steps[i];
      const targets = step.type === "parallel" && step.parallel_steps
        ? step.parallel_steps.map(sub => ({ id: sub.id, artifact: sub.output.artifact }))
        : (step.output?.artifact ? [{ id: step.id, artifact: step.output.artifact }] : []);
      for (const { id, artifact } of targets) {
        const artifactPath = resolve(artifactsRoot, artifact);
        if (await this.artifactManager.exists(artifactPath)) {
          const content = await this.artifactManager.read(artifactPath);
          this.addArtifactToContext(artifactsContext, id, artifact, content);
        }
      }
    }

    for (let idx = startIndex; idx < options.workflow.steps.length; idx++) {
      const step = options.workflow.steps[idx];

      if (step.type === "human_pause") {
        // Persist state (resume from next step)
        await stateManager.saveState({ workflowId: options.workflow.id, nextStepIndex: idx + 1 });
        options.onLog?.(`paused at ${step.id} (human_pause). Resume with: aiwf resume ${options.workflow.id}`);
        return;
      }

      if (step.type === "parallel") {
        const contextDoc = await this.loadContextDoc(options.projectRoot, artifactsRoot);
        await this.runParallelStep(options, stateManager, artifactsRoot, artifactsContext, step, contextDoc);
        await stateManager.saveState({ workflowId: options.workflow.id, nextStepIndex: idx + 1 });
        continue;
      }

      if (!step.output?.artifact) {
        throw new Error(`Step ${step.id} is missing output.artifact`);
      }

      const artifactName = step.output!.artifact;
      const artifactPath = resolve(artifactsRoot, artifactName);
      const shouldSkip =
        step.on_existing === "skip" && (await this.artifactManager.exists(artifactPath));

      if (shouldSkip) {
        const existing = await this.artifactManager.read(artifactPath);
        this.addArtifactToContext(artifactsContext, step.id, artifactName, existing);
        options.onLog?.(`skipped ${step.id} (${artifactName} already exists)`);
        continue;
      }

      options.onLog?.(`running ${step.id}`);

      let skillPath = resolve(options.projectRoot, step.skill!);
      if (!existsSync(skillPath)) {
        skillPath = resolve(PACKAGE_ROOT, step.skill!);
      }
      const skillTemplate = await this.skillLoader.load(skillPath);

      const contextDoc = await this.loadContextDoc(options.projectRoot, artifactsRoot);
      const renderedPrompt = this.templateEngine.render(skillTemplate, {
        workflow: {
          id: options.workflow.id,
          name: options.workflow.name,
          description: options.workflow.description
        },
        tdd: options.workflow.tdd ?? false,
        artifacts: artifactsContext,
        input: step.input,
        context: contextDoc
      });

      if (options.manual) {
        const promptPath = resolve(artifactsRoot, `${artifactName}.prompt.md`);
        if (await this.artifactManager.exists(artifactPath)) {
          const existing = await this.artifactManager.read(artifactPath);
          this.addArtifactToContext(artifactsContext, step.id, artifactName, existing);
          options.onLog?.(`${step.id} resolvido pelo agente (${artifactName} existe)`);
        } else {
          await this.artifactManager.save(promptPath, renderedPrompt);
          options.onLog?.(`prompt renderizado para ${step.id}`);
          console.log(`\n📄 Prompt para "${step.id}" salvo em: ${promptPath}`);
          console.log(`   Processe o prompt e salve o resultado em: ${artifactPath}`);
          console.log(`   Depois execute: aiwf resume ${options.workflow.id} --manual\n`);
          await stateManager.saveState({ workflowId: options.workflow.id, nextStepIndex: idx });
          return;
        }
      } else {
        const output = options.dryRun
          ? this.buildDryRunOutput(step.id, renderedPrompt)
          : await this.callModel(renderedPrompt, options.llmCaller);

        await this.artifactManager.save(artifactPath, output);
        await this.afterStep(artifactsRoot, step.id, output);
        this.addArtifactToContext(artifactsContext, step.id, step.output.artifact, output);
        options.onLog?.(`saved ${step.output.artifact}`);
      }

      // clear persisted state at each successful step (so resume starts after completed step)
      await stateManager.saveState({ workflowId: options.workflow.id, nextStepIndex: idx + 1 });
    }

    // complete -> clear state
    await stateManager.clearState(options.workflow.id);
  }

  private async runParallelStep(
    options: EngineOptions,
    stateManager: StateManager,
    artifactsRoot: string,
    artifactsContext: Record<string, string>,
    step: WorkflowStep,
    contextDoc: string
  ): Promise<void> {
    const subSteps = step.parallel_steps ?? [];
    options.onLog?.(`running parallel step ${step.id} (${subSteps.length} sub-steps)`);

    const base = {
      workflow: {
        id: options.workflow.id,
        name: options.workflow.name,
        description: options.workflow.description
      },
      tdd: options.workflow.tdd ?? false,
      artifacts: artifactsContext
    };

    if (options.manual) {
      // Render a prompt per missing sub-artifact, then stop for manual processing.
      for (const sub of subSteps) {
        const artifactPath = resolve(artifactsRoot, sub.output.artifact);
        if (await this.artifactManager.exists(artifactPath)) {
          const existing = await this.artifactManager.read(artifactPath);
          this.addArtifactToContext(artifactsContext, sub.id, sub.output.artifact, existing);
          options.onLog?.(`${sub.id} resolvido pelo agente (${sub.output.artifact} existe)`);
          continue;
        }
        const skillPath = this.resolveSkillPath(options.projectRoot, sub.skill);
        const skillTemplate = await this.skillLoader.load(skillPath);
        const renderedPrompt = this.templateEngine.render(skillTemplate, {
          ...base,
          input: sub.input,
          context: contextDoc
        });
        const promptPath = resolve(artifactsRoot, `${sub.output.artifact}.prompt.md`);
        await this.artifactManager.save(promptPath, renderedPrompt);
        options.onLog?.(`prompt renderizado para ${sub.id}`);
        console.log(`\n📄 Prompt para "${step.id}/${sub.id}" salvo em: ${promptPath}`);
        console.log(`   Processe o prompt e salve o resultado em: ${artifactPath}`);
        console.log(`   Depois execute: aiwf resume ${options.workflow.id} --manual\n`);
        await stateManager.saveState({ workflowId: options.workflow.id, nextStepIndex: options.workflow.steps.indexOf(step) });
        return;
      }
      return;
    }

    await Promise.all(
      subSteps.map(async (sub: ParallelSubStep) => {
        const artifactPath = resolve(artifactsRoot, sub.output.artifact);
        const shouldSkip =
          sub.on_existing === "skip" && (await this.artifactManager.exists(artifactPath));
        if (shouldSkip) {
          const existing = await this.artifactManager.read(artifactPath);
          this.addArtifactToContext(artifactsContext, sub.id, sub.output.artifact, existing);
          options.onLog?.(`skipped ${sub.id} (${sub.output.artifact} already exists)`);
          return;
        }

        options.onLog?.(`running parallel sub-step ${sub.id}`);
        const skillPath = this.resolveSkillPath(options.projectRoot, sub.skill);
        const skillTemplate = await this.skillLoader.load(skillPath);
        const renderedPrompt = this.templateEngine.render(skillTemplate, {
          ...base,
          input: sub.input,
          context: contextDoc
        });

        const output = options.dryRun
          ? this.buildDryRunOutput(sub.id, renderedPrompt)
          : await this.callModel(renderedPrompt, options.llmCaller);

        await this.artifactManager.save(artifactPath, output);
        await this.afterStep(artifactsRoot, sub.id, output);
        this.addArtifactToContext(artifactsContext, sub.id, sub.output.artifact, output);
        options.onLog?.(`saved ${sub.output.artifact}`);
      })
    );
  }

  private resolveSkillPath(projectRoot: string, skill: string): string {
    const projectPath = resolve(projectRoot, skill);
    return existsSync(projectPath) ? projectPath : resolve(PACKAGE_ROOT, skill);
  }

  private async loadContextDoc(projectRoot: string, artifactsRoot: string): Promise<string> {
    const candidates = [
      resolve(projectRoot, "CONTEXT.md"),
      resolve(artifactsRoot, "CONTEXT.md")
    ];
    for (const candidate of candidates) {
      if (await this.artifactManager.exists(candidate)) {
        return this.artifactManager.read(candidate);
      }
    }
    return "";
  }

  private reorderForTdd(steps: WorkflowDefinition["steps"]): void {
    const implIdx = steps.findIndex(s => s.id === "implement");
    const testIdx = steps.findIndex(s => s.id === "test");
    if (implIdx < 0 || testIdx < 0) return;
    if (testIdx < implIdx) return;

    // Swap: pull sdd-teste before sdd-implement
    const [testStep] = steps.splice(testIdx, 1);
    steps.splice(implIdx, 0, testStep);
  }

  private buildDryRunOutput(stepId: string, renderedPrompt: string): string {
    const lines: string[] = [
      `# DRY RUN: ${stepId}`,
      "",
      "Este arquivo foi gerado com --dry-run.",
      "",
      "## Prompt enviado (simulado)",
      renderedPrompt
    ];

    if (stepId === "workflow-kickoff") {
      lines.push(
        "",
        "## Seed do run-log",
        "",
        "- workflow_id: dry-run",
        "- etapa_atual: workflow-kickoff",
        "- inicio_da_execucao: simulado",
        "- custo_estimado_tokens: 0",
        "- custo_estimado_usd: 0.00",
        "- tempo_estimado_etapa: 0s"
      );
    } else {
      lines.push(
        "",
        "## Run Log Update",
        "",
        `- etapa: ${stepId}`,
        "- resumo: [dry-run simulation]",
        "- estimativa_tokens: 0",
        "- custo_estimado_usd: 0.00",
        "- tempo_estimado: 0s"
      );
    }

    return lines.join("\n");
  }

  private async callModel(prompt: string, llmCaller?: LlmCaller): Promise<string> {
    if (!llmCaller) {
      throw new Error("LLM caller is required when dryRun is false");
    }
    return llmCaller.call(prompt);
  }

  private async afterStep(
    artifactsRoot: string,
    stepId: string,
    artifactContent: string
  ): Promise<void> {
    const section = this.extractRunLogSection(artifactContent, stepId);
    if (!section) return;

    const runLogPath = resolve(artifactsRoot, "run-log.md");

    if (stepId === "workflow-kickoff") {
      await this.artifactManager.save(runLogPath, `# Run Log\n\n${section}\n`);
    } else {
      const existing = (await this.artifactManager.exists(runLogPath))
        ? await this.artifactManager.read(runLogPath)
        : "# Run Log\n\n";
      await this.artifactManager.save(runLogPath, `${existing}\n${section}\n`);
    }
  }

  private extractRunLogSection(content: string, stepId: string): string | null {
    const heading = stepId === "workflow-kickoff"
      ? "## Seed do run-log"
      : "## Run Log Update";

    const lines = content.split("\n");

    // Search from the end for the LAST occurrence (avoids matching inside rendered prompt)
    let start = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim() === heading) {
        start = i;
        break;
      }
    }
    if (start < 0) return null;

    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) {
      if (lines[i].startsWith("## ")) {
        end = i;
        break;
      }
    }

    return lines.slice(start, end).join("\n");
  }

  private addArtifactToContext(
    context: Record<string, string>,
    stepId: string,
    artifactName: string,
    content: string
  ): void {
    context[stepId] = content;
    context[this.normalizeArtifactKey(artifactName)] = content;
  }

  private normalizeArtifactKey(artifactName: string): string {
    return basename(artifactName, extname(artifactName));
  }
}
