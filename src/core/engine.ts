import { basename, extname, resolve } from "node:path";
import type { WorkflowDefinition } from "../types/workflow.types.js";
import { ArtifactManager } from "./artifact-manager.js";
import type { LlmCaller } from "./llm-caller.js";
import { SkillLoader } from "./skill-loader.js";
import { TemplateEngine } from "./template-engine.js";

export interface EngineOptions {
  projectRoot: string;
  workflow: WorkflowDefinition;
  dryRun: boolean;
  llmCaller?: LlmCaller;
  onLog?: (message: string) => void;
}

export class WorkflowEngine {
  private readonly artifactManager = new ArtifactManager();
  private readonly skillLoader = new SkillLoader();
  private readonly templateEngine = new TemplateEngine();

  async run(options: EngineOptions): Promise<void> {
    const artifactsRoot = resolve(options.projectRoot, options.workflow.artifacts_dir);
    const artifactsContext: Record<string, string> = {};

    for (const step of options.workflow.steps) {
      if (step.type === "human_pause") {
        throw new Error(`Step "${step.id}" is type human_pause and is not supported in MVP`);
      }

      const artifactPath = resolve(artifactsRoot, step.output.artifact);
      const shouldSkip =
        step.on_existing === "skip" && (await this.artifactManager.exists(artifactPath));

      if (shouldSkip) {
        const existing = await this.artifactManager.read(artifactPath);
        this.addArtifactToContext(artifactsContext, step.id, step.output.artifact, existing);
        options.onLog?.(`skipped ${step.id} (${step.output.artifact} already exists)`);
        continue;
      }

      options.onLog?.(`running ${step.id}`);
      const skillPath = resolve(options.projectRoot, step.skill);
      const skillTemplate = await this.skillLoader.load(skillPath);

      const renderedPrompt = this.templateEngine.render(skillTemplate, {
        workflow: {
          id: options.workflow.id,
          name: options.workflow.name,
          description: options.workflow.description
        },
        artifacts: artifactsContext,
        input: step.input
      });

      const output = options.dryRun
        ? this.buildDryRunOutput(step.id, renderedPrompt)
        : await this.callModel(renderedPrompt, options.llmCaller);

      await this.artifactManager.save(artifactPath, output);
      this.addArtifactToContext(artifactsContext, step.id, step.output.artifact, output);
      options.onLog?.(`saved ${step.output.artifact}`);
    }
  }

  private buildDryRunOutput(stepId: string, renderedPrompt: string): string {
    return [
      `# DRY RUN: ${stepId}`,
      "",
      "Este arquivo foi gerado com --dry-run.",
      "",
      "## Prompt enviado (simulado)",
      renderedPrompt
    ].join("\n");
  }

  private async callModel(prompt: string, llmCaller?: LlmCaller): Promise<string> {
    if (!llmCaller) {
      throw new Error("LLM caller is required when dryRun is false");
    }
    return llmCaller.call(prompt);
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
