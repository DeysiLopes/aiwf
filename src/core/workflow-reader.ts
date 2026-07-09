import { readFile } from "node:fs/promises";
import { load } from "js-yaml";
import type { WorkflowDefinition, WorkflowStep } from "../types/workflow.types.js";

type RawInput = Record<string, string> | Array<Record<string, string>>;
type RawWorkflow = Omit<WorkflowDefinition, "steps"> & {
  steps: Array<Omit<WorkflowStep, "input"> & { input?: RawInput }>;
};

export class WorkflowReader {
  async load(path: string): Promise<WorkflowDefinition> {
    const content = await readFile(path, "utf-8");
    const parsed = load(content) as RawWorkflow | undefined;

    if (!parsed || typeof parsed !== "object") {
      throw new Error(`Invalid workflow file: ${path}`);
    }
    if (!parsed.id) {
      throw new Error("workflow.id is required");
    }
    if (!parsed.artifacts_dir) {
      throw new Error("workflow.artifacts_dir is required");
    }
    if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
      throw new Error("workflow.steps must be a non-empty array");
    }

    const steps = parsed.steps.map((step, index) => this.normalizeStep(step, index));

    return {
      id: parsed.id,
      name: parsed.name ?? parsed.id,
      description: parsed.description ?? "",
      artifacts_dir: parsed.artifacts_dir,
      steps,
      tdd: parsed.tdd ?? false
    };
  }

  private normalizeStep(step: RawWorkflow["steps"][number], index: number): WorkflowStep {
    if (!step.id) {
      throw new Error(`workflow.steps[${index}].id is required`);
    }
    if (!step.name) {
      throw new Error(`workflow.steps[${index}].name is required`);
    }
    const stepType = (step as any).type ?? "skill";

    if (stepType !== "human_pause") {
      if (!step.skill) {
        throw new Error(`workflow.steps[${index}].skill is required`);
      }
      if (!step.output?.artifact) {
        throw new Error(`workflow.steps[${index}].output.artifact is required`);
      }
    }

    return {
      id: step.id,
      name: step.name,
      skill: step.skill,
      output: step.output,
      input: this.normalizeInput(step.input),
      on_existing: step.on_existing ?? "skip",
      type: stepType as any
    };
  }

  private normalizeInput(input?: RawInput): Record<string, string> {
    if (!input) {
      return {};
    }
    if (!Array.isArray(input)) {
      return input;
    }

    return input.reduce<Record<string, string>>((acc, item) => {
      for (const [key, value] of Object.entries(item)) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }
}
