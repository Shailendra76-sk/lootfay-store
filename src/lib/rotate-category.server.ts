import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { Category, enforceGlobalCap, fetchCategoryProducts } from "./sync-products.server";

/**
 * Rotating per-category sync.
 *  - Fetches up to `target` fresh products for the category.
 *  - If N new (not-already-stored) products arrive, the OLDEST N rows in that
 *    category are removed and replaced — keeping the storefront fresh while
 *    capping each category at `target`.
 */
export async function rotateCategoryProducts(category: Category, target = 200) {
  const { products: fresh, fetched } = await fetchCategoryProducts(category, target);
  if (fresh.length === 0) return { ok: true, category, inserted: 0, removed: 0, fetched };

  const { data: existing, error: selErr } = await supabaseAdmin
    .from("amazon_products")
    .select("id, clean_amazon_url, created_at")
    .eq("category", category)
    .order("created_at", { ascending: true });
  if (selErr) throw new Error(`Select failed: ${selErr.message}`);

  const existingUrls = new Set((existing ?? []).map((r) => r.clean_amazon_url));
  const toInsert = fresh.filter((p) => !existingUrls.has(p.clean_amazon_url));
  if (toInsert.length === 0) return { ok: true, category, inserted: 0, removed: 0, fetched };

  const currentCount = existing?.length ?? 0;
  const projected = currentCount + toInsert.length;
  const overflow = Math.max(0, projected - target);
  const removeIds = (existing ?? []).slice(0, overflow).map((r) => r.id);

  if (removeIds.length > 0) {
    const { error: delErr } = await supabaseAdmin
      .from("amazon_products")
      .delete()
      .in("id", removeIds);
    if (delErr) throw new Error(`Delete failed: ${delErr.message}`);
  }

  const { error: insErr } = await supabaseAdmin
    .from("amazon_products")
    .insert(toInsert as any);
  if (insErr) throw new Error(`Insert failed: ${insErr.message}`);

  // Global FIFO 25k cap — trim the oldest rows across the whole table if needed.
  const cap = await enforceGlobalCap(supabaseAdmin);

  return {
    ok: true,
    category,
    inserted: toInsert.length,
    removed: removeIds.length + cap.removed,
    fetched,
  };
}
