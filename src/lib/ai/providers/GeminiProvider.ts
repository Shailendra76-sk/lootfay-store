import { ITextProvider, TextGenerationRequest } from "../types";

export class GeminiProvider implements ITextProvider {
  async generateText(request: TextGenerationRequest): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    const model =
      request.model ||
      process.env.GEMINI_MODEL ||
      process.env.AI_DEFAULT_MODEL ||
      "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${request.systemPrompt}\n\n${request.userPrompt}` }] },
        ],
        generationConfig: { temperature: 0.7 },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error");
      throw new Error(`Gemini API error ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return text.trim().replace(/^["']|["']$/g, "");
  }
}
