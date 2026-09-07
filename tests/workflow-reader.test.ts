import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { WorkflowReader } from "../src/core/workflow-reader.js";

describe("WorkflowReader", () => {
  it("normalizes parallel steps", async () => {
    const dir = await mkdtemp(join(tmpdir(), "aiwf-wf-"));
    const path = join(dir, "workflow.yaml");
    await writeFile(
      path,
      [
        "id: T-1",
        "name: Test",
        "description: Test flow",
        "artifacts_dir: .agents/artifacts",
        "steps:",
        "  - id: review",
        "    name: Review",
        "    type: parallel",
        "    parallel_steps:",
        "      - id: a",
        "        name: A",
        "        skill: skills/a/SKILL.md",
        "        output:",
        "          artifact: a.md",
        "      - id: b",
        "        name: B",
        "        skill: skills/b/SKILL.md",
        "        output:",
        "          artifact: b.md"
      ].join("\n"),
      "utf-8"
    );

    const reader = new WorkflowReader();
    const wf = await reader.load(path);

    expect(wf.steps).toHaveLength(1);
    const step = wf.steps[0];
    expect(step.type).toBe("parallel");
    expect(step.parallel_steps).toHaveLength(2);
    expect(step.parallel_steps![1].output.artifact).toBe("b.md");
    expect(step.parallel_steps![0].on_existing).toBe("overwrite");

    await rm(dir, { recursive: true, force: true });
  });

  it("fails when a parallel step has no parallel_steps", async () => {
    const dir = await mkdtemp(join(tmpdir(), "aiwf-wf-"));
    const path = join(dir, "workflow.yaml");
    await writeFile(
      path,
      [
        "id: T-1",
        "name: Test",
        "description: Test flow",
        "artifacts_dir: .agents/artifacts",
        "steps:",
        "  - id: review",
        "    name: Review",
        "    type: parallel"
      ].join("\n"),
      "utf-8"
    );

    const reader = new WorkflowReader();
    await expect(reader.load(path)).rejects.toThrow("parallel_steps");

    await rm(dir, { recursive: true, force: true });
  });
});