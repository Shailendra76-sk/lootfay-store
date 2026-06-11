import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CATEGORIES, Category, fetchAndNormalizeDeals } from "./sync-products.server";
import { rotateCategoryProducts } from "./rotate-category.server";

function assertAdmin(secret: string | undefined) {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) throw new Error("ADMIN_SECRET not configured on server");
  if (!secret || secret !== expected) throw new Error("Unauthorized: invalid admin secret");
}

/** Full wipe + reload across all categories (manual admin button). */
export const syncAmazonProducts = createServerFn({ method: "POST" })
  .inputValidator((data: { secret: string }) => {
    if (!data || typeof data.secret !== "string") throw new Error("secret required");
    return data;
  })
  .handler(async ({ data }) => {
    assertAdmin(data.secret);
    const { products, fetched, perCategory } = await fetchAndNormalizeDeals();
    if (products.length === 0) throw new Error("No usable products after normalization");

    const { error: delErr } = await supabaseAdmin
      .from("amazon_products")
      .delete()
      .not("id", "is", null);
    if (delErr) throw new Error(`Delete failed: ${delErr.message}`);

    const { error: insErr } = await supabaseAdmin.from("amazon_products").insert(products as any);
    if (insErr) throw new Error(`Insert failed: ${insErr.message}`);

    return { ok: true, count: products.length, fetched, perCategory };
  });

/** One-off per-category rotating sync triggered from the admin page. */
export const syncCategory = createServerFn({ method: "POST" })
  .inputValidator((data: { category: Category; secret: string }) => {
    if (!CATEGORIES.includes(data.category)) throw new Error("Invalid category");
    if (!data.secret || typeof data.secret !== "string") throw new Error("secret required");
    return data;
  })
  .handler(async ({ data }) => {
    assertAdmin(data.secret);
    return rotateCategoryProducts(data.category);
  });
