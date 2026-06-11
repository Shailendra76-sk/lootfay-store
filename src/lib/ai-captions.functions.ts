import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { TextProviderManager } from "@/lib/ai/TextProviderManager";
import type { TextGenerationRequest } from "@/lib/ai/types";

// Internal wrapper to maintain exact same signature for existing functions
async function callAI(system: string, user: string): Promise<string> {
  const request: TextGenerationRequest = {
    systemPrompt: system,
    userPrompt: user,
  };
  return await TextProviderManager.generateTextWithFallback(request);
}

/** Generate a short Hinglish catchy caption for a product card and cache in DB. */
export const generateProductCaption = createServerFn({ method: "POST" })
  .inputValidator((d: { productId: string }) => d)
  .handler(async ({ data }) => {
    const { data: p, error } = await supabaseAdmin
      .from("amazon_products")
      .select("id, title, current_price, original_price, discount_percentage, ai_caption")
      .eq("id", data.productId)
      .single();
    if (error || !p) throw new Error("Product not found");
    if (p.ai_caption) return { caption: p.ai_caption as string, cached: true };

    const priceStr = p.current_price != null ? `₹${p.current_price}` : "best price";
    const mrpStr = p.original_price != null ? `₹${p.original_price}` : "—";
    const off = p.discount_percentage != null ? `${p.discount_percentage}% off` : "";

    const caption = await callAI(
      "Tum LootBazaar ke ek shopping deal copywriter ho. Hinglish (Roman Hindi + English mix) me ek catchy, energetic 1-line caption likho — max 14 words. 1-2 relevant emojis use karo. No quotes, no hashtags, no markdown.",
      `Product: ${p.title}\nPrice: ${priceStr} (MRP ${mrpStr}, ${off})\nEk killer caption do jo logon ko abhi buy karne ke liye excite kare.`,
    );

    const clean = caption.split("\n")[0].slice(0, 180);
    await supabaseAdmin.from("amazon_products").update({ ai_caption: clean }).eq("id", p.id);
    return { caption: clean, cached: false };
  });

/** Generate a longer share message (WhatsApp/Telegram). Not cached — fresh each time. */
export const generateShareMessage = createServerFn({ method: "POST" })
  .inputValidator((d: { productId: string; url: string }) => d)
  .handler(async ({ data }) => {
    const { data: p, error } = await supabaseAdmin
      .from("amazon_products")
      .select("title, current_price, original_price, discount_percentage")
      .eq("id", data.productId)
      .single();
    if (error || !p) throw new Error("Product not found");

    const priceStr = p.current_price != null ? `₹${p.current_price}` : "best price";
    const mrpStr = p.original_price != null ? `MRP ₹${p.original_price}` : "";
    const off = p.discount_percentage != null ? `${p.discount_percentage}% OFF` : "";

    const msg = await callAI(
      "Tum LootBazaar ke deal sharer ho. Hinglish me ek WhatsApp/Telegram ke liye 3-4 line ka exciting share message likho. Emojis use karo (🔥💥🛒). Last line me 'Abhi grab karo' jaisa CTA. Link ya price MAT add karo — wo alag se add hoga. No markdown, no quotes.",
      `Product: ${p.title}\nDeal: ${priceStr} ${mrpStr} ${off}\nMessage likho.`,
    );

    const full = `${msg.trim()}\n\n💰 Price: ${priceStr} ${off ? `(${off})` : ""}\n🛒 ${data.url}\n\n— LootBazaar.in`;
    return { message: full };
  });
