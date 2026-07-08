import { readFile } from "node:fs/promises";

export class SkillLoader {
  async load(path: string): Promise<string> {
    return readFile(path, "utf-8");
  }
}
