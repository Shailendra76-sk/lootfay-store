export type ProviderType =
  | "lovable"
  | "openrouter"
  | "gemini"
  | "groq"
  | "deepseek"
  | "mistral"
  | "together"
  | "novita"
  | "replicate"
  | "nim"
  | "huggingface"
  | "custom";

export interface TextGenerationRequest {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
}

export interface ITextProvider {
  generateText(request: TextGenerationRequest): Promise<string>;
}

// Future-proofing for image generation (no implementation required yet)
export interface IImageProvider {
  generateImage(prompt: string, options?: Record<string, unknown>): Promise<string>;
}
