import OpenAI from "openai";

export interface LlmCaller {
  call(prompt: string): Promise<string>;
}

export type AiProvider = "openai" | "zen";

export class OpenAILlmCaller implements LlmCaller {
  private readonly client: OpenAI;

  constructor(
    private readonly model: string,
    private readonly provider: AiProvider = "openai"
  ) {
    const config = this.getConfig();
    if (!config.apiKey) {
      throw new Error(
        provider === "zen"
          ? "OPENCODE_API_KEY is required for Zen provider"
          : "OPENAI_API_KEY is required to run without --dry-run"
      );
    }

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    });
  }

  private getConfig() {
    if (this.provider === "zen") {
      return {
        apiKey: process.env.OPENCODE_API_KEY,
        baseURL: "https://opencode.ai/zen/v1"
      };
    }
    return {
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || undefined
    };
  }

  async call(prompt: string): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }]
    });

    const text = res.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("Model returned an empty response");
    }
    return text;
  }
}
