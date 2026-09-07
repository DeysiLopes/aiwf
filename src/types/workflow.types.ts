export type OnExisting = "skip" | "overwrite";
export type WorkflowStepType = "skill" | "human_pause" | "parallel";

export interface StepOutput {
  artifact: string;
}

export interface ParallelSubStep {
  id: string;
  name: string;
  skill: string;
  input: Record<string, string>;
  output: StepOutput;
  on_existing?: OnExisting;
}

export interface WorkflowStep {
  id: string;
  name: string;
  skill?: string;
  input: Record<string, string>;
  output?: StepOutput;
  on_existing: OnExisting;
  type?: WorkflowStepType;
  parallel_steps?: ParallelSubStep[];
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  artifacts_dir: string;
  steps: WorkflowStep[];
  tdd?: boolean;
}
