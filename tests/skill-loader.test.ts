import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { SkillLoader } from "../src/core/skill-loader.js";

describe("SkillLoader", () => {
  it("strips leading YAML frontmatter", async () => {
    const dir = await mkdtemp(join(tmpdir(), "aiwf-skill-"));
    const path = join(dir, "SKILL.md");
    await writeFile(
      path,
      [
        "---",
        "name: test",
        'description: "desc"',
        "---",
        "",
        "# Body",
        "",
        "## Guardrails",
        "- Respond in English."
      ].join("\n"),
      "utf-8"
    );

    const loader = new SkillLoader();
    const content = await loader.load(path);

    expect(content).not.toContain("name: test");
    expect(content).not.toContain("---");
    expect(content).toContain("# Body");
    expect(content).toContain("Respond in English.");

    await rm(dir, { recursive: true, force: true });
  });

  it("keeps content untouched when no frontmatter", async () => {
    const dir = await mkdtemp(join(tmpdir(), "aiwf-skill-"));
    const path = join(dir, "SKILL.md");
    const body = "# Plain\n\nNo frontmatter here.";
    await writeFile(path, body, "utf-8");

    const loader = new SkillLoader();
    const content = await loader.load(path);

    expect(content).toBe(body);

    await rm(dir, { recursive: true, force: true });
  });
});