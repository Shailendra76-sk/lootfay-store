import { ITextProvider, TextGenerationRequest } from "../types";

export class LovableProvider implements ITextProvider {
  async generateText(request: TextGenerationRequest): Promise<string> {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY not configured");

    const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const MODEL =
      request.model ||
      process.env.LOVABLE_MODEL ||
      process.env.AI_DEFAULT_MODEL ||
      "google/gemini-3-flash-preview";

    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "Unknown error");
      throw new Error(`Lovable AI Gateway ${res.status}: ${t.slice(0, 200)}`);
    }

    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? "";
    return text.trim().replace(/^["']|["']$/g, "");
  }
}
