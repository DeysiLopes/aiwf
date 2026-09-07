export interface RenderContext {
  workflow: {
    id: string;
    name: string;
    description: string;
  };
  tdd: boolean;
  artifacts: Record<string, string>;
  input: Record<string, string>;
  context?: string;
}

export class TemplateEngine {
  render(template: string, context: RenderContext): string {
    const resolve = (expr: string): string => {
      const key = expr.trim();
      if (key.startsWith("workflow.")) {
        const workflowKey = key.replace("workflow.", "") as keyof RenderContext["workflow"];
        return context.workflow[workflowKey] ?? "";
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
      if (key === "context") {
        return context.context ?? "";
      }
      return "";
    };

    let result = template;
    let prev = "";
    const MAX_PASSES = 5;
    for (let pass = 0; pass < MAX_PASSES; pass++) {
      if (result === prev) break;
      prev = result;
      result = result.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, expr: string) => resolve(expr));
    }
    return result;
  }
}
