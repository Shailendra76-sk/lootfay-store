import { ITextProvider, TextGenerationRequest, ProviderType } from "../types";

const PROVIDER_CONFIGS: Record<
  Exclude<ProviderType, "lovable" | "gemini">,
  { keyEnv: string; modelEnv: string; baseUrlEnv: string; defaultBaseUrl: string }
> = {
  openrouter: {
    keyEnv: "OPENROUTER_API_KEY",
    modelEnv: "OPENROUTER_MODEL",
    baseUrlEnv: "OPENROUTER_BASE_URL",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
  },
  groq: {
    keyEnv: "GROQ_API_KEY",
    modelEnv: "GROQ_MODEL",
    baseUrlEnv: "GROQ_BASE_URL",
    defaultBaseUrl: "https://api.groq.com/openai/v1",
  },
  deepseek: {
    keyEnv: "DEEPSEEK_API_KEY",
    modelEnv: "DEEPSEEK_MODEL",
    baseUrlEnv: "DEEPSEEK_BASE_URL",
    defaultBaseUrl: "https://api.deepseek.com/v1",
  },
  mistral: {
    keyEnv: "MISTRAL_API_KEY",
    modelEnv: "MISTRAL_MODEL",
    baseUrlEnv: "MISTRAL_BASE_URL",
    defaultBaseUrl: "https://api.mistral.ai/v1",
  },
  together: {
    keyEnv: "TOGETHER_API_KEY",
    modelEnv: "TOGETHER_MODEL",
    baseUrlEnv: "TOGETHER_BASE_URL",
    defaultBaseUrl: "https://api.together.xyz/v1",
  },
  novita: {
    keyEnv: "NOVITA_API_KEY",
    modelEnv: "NOVITA_MODEL",
    baseUrlEnv: "NOVITA_BASE_URL",
    defaultBaseUrl: "https://api.novita.ai/v3/openai",
  },
  replicate: {
    keyEnv: "REPLICATE_API_KEY",
    modelEnv: "REPLICATE_MODEL",
    baseUrlEnv: "REPLICATE_BASE_URL",
    defaultBaseUrl: "https://openai-proxy.replicate.com/v1",
  },
  nim: {
    keyEnv: "NIM_API_KEY",
    modelEnv: "NIM_MODEL",
    baseUrlEnv: "NIM_BASE_URL",
    defaultBaseUrl: "https://integrate.api.nvidia.com/v1",
  },
  huggingface: {
    keyEnv: "HUGGINGFACE_API_KEY",
    modelEnv: "HUGGINGFACE_MODEL",
    baseUrlEnv: "HUGGINGFACE_BASE_URL",
    defaultBaseUrl: "https://api-inference.huggingface.co/v1",
  },
  custom: {
    keyEnv: "CUSTOM_API_KEY",
    modelEnv: "CUSTOM_MODEL",
    baseUrlEnv: "CUSTOM_BASE_URL",
    defaultBaseUrl: "",
  },
};

export class OpenAICompatibleProvider implements ITextProvider {
  constructor(private providerName: Exclude<ProviderType, "lovable" | "gemini">) {}

  async generateText(request: TextGenerationRequest): Promise<string> {
    const config = PROVIDER_CONFIGS[this.providerName];
    const apiKey = process.env[config.keyEnv];
    if (!apiKey) throw new Error(`API key not configured for ${this.providerName}`);

    const baseUrl = process.env[config.baseUrlEnv] || config.defaultBaseUrl;
    if (!baseUrl) throw new Error(`Base URL not configured for ${this.providerName}`);

    const model =
      request.model ||
      process.env[config.modelEnv] ||
      process.env.AI_DEFAULT_MODEL ||
      "default-model";
    const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    if (this.providerName === "openrouter") {
      if (process.env.OPENROUTER_REFERER) headers["HTTP-Referer"] = process.env.OPENROUTER_REFERER;
      if (process.env.OPENROUTER_TITLE) headers["X-Title"] = process.env.OPENROUTER_TITLE;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error");
      throw new Error(`${this.providerName} API error ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? "";
    return text.trim().replace(/^["']|["']$/g, "");
  }
}
