import { readFile } from "node:fs/promises";

export class SkillLoader {
  async load(path: string): Promise<string> {
    const content = await readFile(path, "utf-8");
    return this.stripFrontmatter(content);
  }

  private stripFrontmatter(content: string): string {
    if (!content.startsWith("---")) {
      return content;
    }
    // Locate the closing delimiter of the leading YAML block.
    const firstNewline = content.indexOf("\n");
    if (firstNewline < 0) return content;
    const closeIdx = content.indexOf("\n---", firstNewline + 1);
    if (closeIdx < 0) return content;
    // Everything after the closing delimiter (strip trailing newline after the block too).
    return content.slice(closeIdx + 4).replace(/^\n/, "");
  }
}