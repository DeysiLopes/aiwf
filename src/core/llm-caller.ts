import OpenAI from "openai";

export interface LlmCaller {
  call(prompt: string): Promise<string>;
}

export class OpenAILlmCaller implements LlmCaller {
  private readonly client: OpenAI;

  constructor(private readonly model: string) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required to run without --dry-run");
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL || undefined
    });
  }

  async call(prompt: string): Promise<string> {
    const response = await this.client.responses.create({
      model: this.model,
      input: prompt
    });

    const text = response.output_text?.trim();
    if (!text) {
      throw new Error("Model returned an empty response");
    }
    return text;
  }
}
