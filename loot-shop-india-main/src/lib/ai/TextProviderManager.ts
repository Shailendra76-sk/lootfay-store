import { ProviderType, ITextProvider, TextGenerationRequest } from "./types";
import { LovableProvider } from "./providers/LovableProvider";
import { GeminiProvider } from "./providers/GeminiProvider";
import { OpenAICompatibleProvider } from "./providers/OpenAICompatibleProvider";

const VALID_PROVIDERS: ProviderType[] = [
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

function validateProvider(name: string | undefined, fallback: ProviderType): ProviderType {
  if (name && VALID_PROVIDERS.includes(name as ProviderType)) {
    return name as ProviderType;
  }
  return fallback;
}

export function getProviderInstance(name: ProviderType): ITextProvider {
  switch (name) {
    case "lovable":
      return new LovableProvider();
    case "gemini":
      return new GeminiProvider();
    case "openrouter":
    case "groq":
    case "deepseek":
    case "mistral":
    case "together":
    case "novita":
    case "replicate":
    case "nim":
    case "huggingface":
    case "custom":
      return new OpenAICompatibleProvider(name);
    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}

export class TextProviderManager {
  static async generateTextWithFallback(request: TextGenerationRequest): Promise<string> {
    const rawDefault = process.env.AI_DEFAULT_PROVIDER;
    const rawFallback = process.env.AI_FALLBACK_PROVIDER;

    const defaultProvider = validateProvider(rawDefault, "lovable");
    const fallbackProvider = validateProvider(rawFallback, "lovable");

    try {
      const provider = getProviderInstance(defaultProvider);
      return await provider.generateText(request);
    } catch (error) {
      console.error(`[AI] Primary provider '${defaultProvider}' failed:`, error);

      if (defaultProvider === fallbackProvider) {
        throw error; // No point retrying the same provider
      }

      console.warn(`[AI] Falling back to '${fallbackProvider}'...`);
      try {
        const fallback = getProviderInstance(fallbackProvider);
        return await fallback.generateText(request);
      } catch (fallbackError) {
        console.error(`[AI] Fallback provider '${fallbackProvider}' also failed:`, fallbackError);
        throw new Error(
          `AI generation failed. Primary (${defaultProvider}) and Fallback (${fallbackProvider}) both failed.`,
        );
      }
    }
  }
}
