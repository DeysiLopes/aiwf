export type OnExisting = "skip" | "overwrite";

export interface StepOutput {
  artifact: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  skill?: string;
  input: Record<string, string>;
  output?: StepOutput;
  on_existing: OnExisting;
  type?: "skill" | "human_pause";
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  artifacts_dir: string;
  steps: WorkflowStep[];
}
