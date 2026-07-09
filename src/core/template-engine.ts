export interface RenderContext {
  workflow: {
    id: string;
    name: string;
    description: string;
  };
  tdd: boolean;
  artifacts: Record<string, string>;
  input: Record<string, string>;
}

export class TemplateEngine {
  render(template: string, context: RenderContext): string {
    return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, expression: string) => {
      const key = expression.trim();
      if (key.startsWith("workflow.")) {
        const workflowKey = key.replace("workflow.", "") as keyof RenderContext["workflow"];
        const value = context.workflow[workflowKey];
        return value ?? "";
      }

      if (key.startsWith("artifacts.")) {
        const artifactKey = key.replace("artifacts.", "");
        return context.artifacts[artifactKey] ?? "";
      }

      if (key.startsWith("input.")) {
        const inputKey = key.replace("input.", "");
        return context.input[inputKey] ?? "";
      }

      if (key === "tdd") {
        return context.tdd ? "true" : "false";
      }

      return "";
    });
  }
}
