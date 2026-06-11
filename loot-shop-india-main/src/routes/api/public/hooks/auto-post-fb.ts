import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateShareMessage } from "@/lib/ai-captions.functions";
import { AMAZON_AFFILIATE_TAG } from "@/lib/affiliate";

/**
 * Auto-poster: picks the least-recently-posted product, generates an AI
 * Hinglish caption, and posts to Facebook Page with photo + caption + links.
 * Called by pg_cron hourly (6 AM – 10 PM IST). GET enabled for manual browser test.
 */
export const Route = createFileRoute("/api/public/hooks/auto-post-fb")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.CRON_SECRET;
        if (!expected) {
          return Response.json({ ok: false, error: "CRON_SECRET not configured" }, { status: 500 });
        }
        const header = request.headers.get("x-cron-secret");
        if (!header || header !== expected) {
          return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }
        let keyword: string | undefined;
        try {
          const body = (await request.json()) as { keyword?: string };
          keyword = body?.keyword?.trim() || undefined;
        } catch {
          // no body
        }
        return run(keyword);
      },
    },
  },
});

async function run(keyword?: string): Promise<Response> {
  try {
    const pageId = process.env.FB_PAGE_ID?.trim();
    const token = process.env.FB_PAGE_ACCESS_TOKEN?.trim();
    const waUrl =
      process.env.WHATSAPP_CHANNEL_URL?.trim() ||
      "https://whatsapp.com/channel/0029VbCy92nBadmau8nw0v3j";
    if (!pageId || !token) {
      return Response.json(
        { ok: false, error: "FB_PAGE_ID / FB_PAGE_ACCESS_TOKEN missing" },
        { status: 500 },
      );
    }

    const buildQuery = (kw?: string) => {
      let q = supabaseAdmin
        .from("amazon_products")
        .select(
          "id, title, image_url, clean_amazon_url, current_price, original_price, discount_percentage, last_fb_posted_at",
        )
        .not("image_url", "is", null);
      if (kw) q = q.ilike("title", `%${kw}%`);
      return q
        .order("last_fb_posted_at", { ascending: true, nullsFirst: true })
        .limit(15);
    };

    let { data: products, error } = await buildQuery(keyword);
    if (error) throw new Error(error.message);
    if ((!products || products.length === 0) && keyword) {
      // fallback: no keyword match, pick any product
      ({ data: products, error } = await buildQuery());
      if (error) throw new Error(error.message);
    }
    if (!products || products.length === 0) {
      return Response.json({ ok: false, error: "no products" }, { status: 404 });
    }

    const product = products
      .slice()
      .sort(
        (a, b) => (b.discount_percentage ?? 0) - (a.discount_percentage ?? 0),
      )[0];

    const u = new URL(product.clean_amazon_url);
    u.searchParams.set("tag", AMAZON_AFFILIATE_TAG);
    const affUrl = u.toString();

    let aiMsg = "";
    try {
      const r = await generateShareMessage({
        data: { productId: product.id, url: affUrl },
      });
      aiMsg = r.message.split("\n\n💰")[0].trim();
    } catch {
      aiMsg = `🔥 ${product.title}\n💥 Aaj ka dhamakedaar deal!`;
    }

    const priceLine =
      product.current_price != null
        ? `💰 Price: ₹${product.current_price}${
            product.discount_percentage
              ? ` (${product.discount_percentage}% OFF)`
              : ""
          }`
        : "";

    const caption = [
      aiMsg,
      "",
      priceLine,
      `🛒 Buy Now: ${affUrl}`,
      "",
      `📢 24/7 Loot Alerts WhatsApp Channel:`,
      waUrl,
      "",
      "— LootBazaar.in",
      "#LootDeal #Amazon #Sale #Discount",
    ]
      .filter(Boolean)
      .join("\n");

    const fbRes = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}/photos`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: product.image_url,
          caption,
          access_token: token,
        }),
      },
    );
    const fbJson = (await fbRes.json()) as {
      id?: string;
      post_id?: string;
      error?: { message: string };
    };
    if (!fbRes.ok || fbJson.error) {
      return Response.json(
        {
          ok: false,
          error: fbJson.error?.message || `FB ${fbRes.status}`,
          productId: product.id,
        },
        { status: 502 },
      );
    }

    await supabaseAdmin
      .from("amazon_products")
      .update({ last_fb_posted_at: new Date().toISOString() })
      .eq("id", product.id);

    return Response.json({
      ok: true,
      productId: product.id,
      productTitle: product.title,
      fbPostId: fbJson.post_id || fbJson.id,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[auto-post-fb] failed:", msg);
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
