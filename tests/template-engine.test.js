import { describe, expect, it } from "vitest";
import { TemplateEngine } from "../src/core/template-engine.js";
describe("TemplateEngine", () => {
    it("replaces workflow and artifact placeholders", () => {
        const engine = new TemplateEngine();
        const result = engine.render("Story: {{workflow.description}}\nSpec: {{artifacts.specification}}\nInput: {{input.user_story}}", {
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
        });
        expect(result).toContain("Story: Desc");
        expect(result).toContain("Spec: Spec body");
        expect(result).toContain("Input: User story body");
    });
});
