import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateSlug } from "@/lib/slug";

export const getRelatedProducts = createServerFn({ method: "POST" })
  .inputValidator((d: { productId: string; category: string | null }) => d)
  .handler(async ({ data }) => {
    let query = supabaseAdmin
      .from("amazon_products")
      .select(
        "id, title, image_url, current_price, original_price, discount_percentage, category, clean_amazon_url, ai_caption",
      )
      .neq("id", data.productId)
      .limit(8);

    if (data.category) {
      query = query.eq("category", data.category);
    }

    // Fallback to random products if category has less than 4 items
    const { data: products, error } = await query;

    if (error || !products || products.length === 0) {
      const { data: fallback } = await supabaseAdmin
        .from("amazon_products")
        .select(
          "id, title, image_url, current_price, original_price, discount_percentage, category, clean_amazon_url, ai_caption",
        )
        .neq("id", data.productId)
        .limit(8);

      return (fallback || []).map((p) => ({
        ...p,
        slug: generateSlug(p.title, p.id),
      }));
    }

    return products.map((p) => ({
      ...p,
      slug: generateSlug(p.title, p.id),
    }));
  });
