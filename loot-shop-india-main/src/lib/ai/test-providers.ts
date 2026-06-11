import { createServerFn } from "@tanstack/react-start";
import { ProviderType, TextGenerationRequest } from "./types";
import { getProviderInstance } from "./TextProviderManager";

const ALL_PROVIDERS: ProviderType[] = [
  "lovable",
  "openrouter",
  "gemini",
  "groq",
  "deepseek",
  "mistral",
  "together",
  "novita",
  "replicate",
  "nim",
  "huggingface",
  "custom",
];

export const testAllAIProviders = createServerFn({ method: "POST" }).handler(async () => {
  const results: Record<string, { status: "success" | "error"; message: string; timeMs: number }> =
    {};
  const testRequest: TextGenerationRequest = {
    systemPrompt: 'You are a testing assistant. Reply with exactly "OK".',
    userPrompt: "Test",
  };

  for (const provider of ALL_PROVIDERS) {
    const start = Date.now();
    try {
      const configKey =
        provider === "lovable"
          ? "LOVABLE_API_KEY"
          : provider === "gemini"
            ? "GEMINI_API_KEY"
            : `${provider.toUpperCase()}_API_KEY`;

      if (!process.env[configKey]) {
        results[provider] = { status: "error", message: "API key not configured", timeMs: 0 };
        continue;
      }

      const instance = getProviderInstance(provider);
      const response = await instance.generateText(testRequest);
      results[provider] = {
        status: "success",
        message:
          response === "OK"
            ? "Responded correctly"
            : `Unexpected response: ${response.slice(0, 50)}`,
        timeMs: Date.now() - start,
      };
    } catch (error: unknown) {
      results[provider] = {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timeMs: Date.now() - start,
      };
    }
  }

  return results;
});
