import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";

export interface WorkflowState {
  nextStepIndex: number;
  workflowId: string;
}

export class StateManager {
  constructor(private readonly projectRoot: string) {}

  private stateDir() {
    return resolve(this.projectRoot, ".aiwf", "state");
  }

  private statePath(workflowId: string) {
    return resolve(this.stateDir(), `${workflowId}.json`);
  }

  async saveState(state: WorkflowState): Promise<void> {
    await mkdir(this.stateDir(), { recursive: true });
    await writeFile(this.statePath(state.workflowId), JSON.stringify(state, null, 2), "utf-8");
  }

  async loadState(workflowId: string): Promise<WorkflowState | null> {
    try {
      const content = await readFile(this.statePath(workflowId), "utf-8");
      return JSON.parse(content) as WorkflowState;
    } catch {
      return null;
    }
  }

  async clearState(workflowId: string): Promise<void> {
    try {
      await unlink(this.statePath(workflowId));
    } catch {
      // ignore
    }
  }
}
