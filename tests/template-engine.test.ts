import { describe, expect, it } from "vitest";
import { TemplateEngine } from "../src/core/template-engine.js";

describe("TemplateEngine", () => {
  it("replaces workflow and artifact placeholders", () => {
    const engine = new TemplateEngine();
    const result = engine.render(
      "Story: {{workflow.description}}\nSpec: {{artifacts.specification}}\nInput: {{input.user_story}}",
      {
        workflow: {
          id: "STORY-001",
          name: "Story",
          description: "Desc"
        },
        artifacts: {
          specification: "Spec body"
        },
        input: {
          user_story: "User story body"
        }
      }
    );

    expect(result).toContain("Story: Desc");
    expect(result).toContain("Spec: Spec body");
    expect(result).toContain("Input: User story body");
  });

  it("replaces the context placeholder", () => {
    const engine = new TemplateEngine();
    const result = engine.render(
      "Vocab: {{context}}\nEmpty: {{context}}",
      {
        workflow: { id: "S", name: "S", description: "D" },
        tdd: false,
        artifacts: {},
        input: {},
        context: "materialization cascade"
      }
    );

    expect(result).toContain("Vocab: materialization cascade");
    expect(result).toContain("Empty: materialization cascade");
  });

  it("leaves context empty when not provided", () => {
    const engine = new TemplateEngine();
    const result = engine.render(
      "Vocab: {{context}}",
      {
        workflow: { id: "S", name: "S", description: "D" },
        tdd: false,
        artifacts: {},
        input: {}
      }
    );

    expect(result).toContain("Vocab: ");
  });
});
