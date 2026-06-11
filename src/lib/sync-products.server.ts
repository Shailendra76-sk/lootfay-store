import { buildCleanAmazonUrl, extractAsin } from "./affiliate";

type RawDeal = Record<string, any>;

export const CATEGORIES = [
  "Electronics",
  "Gadgets",
  "Fashion",
  "Home & Kitchen",
  "Books",
  "Sports",
] as const;
export type Category = (typeof CATEGORIES)[number];

/**
 * Search keywords used per category. We fan out across MANY queries per
 * category to make sure every bucket actually fills up (single broad queries
 * like "electronics deals" return repetitive results and leave categories thin).
 * Includes specifically-trending low-price items the user called out
 * (bluetooth earbuds, smartwatches, trimmers, etc).
 */
const CATEGORY_QUERIES: Record<Category, string[]> = {
  Electronics: [
    "bluetooth earbuds under 1000",
    "boat earbuds",
    "neckband bluetooth",
    "bluetooth speaker",
    "power bank 20000mah",
    "fast charger 25w",
    "usb c cable",
    "wired earphones",
    "mobile cover",
    "screen guard",
  ],
  Gadgets: [
    "smart watch",
    "fitness band",
    "wireless mouse",
    "mechanical keyboard",
    "ring light",
    "selfie stick tripod",
    "smart bulb",
    "alexa echo dot",
    "trimmer for men",
    "hair dryer",
  ],
  Fashion: [
    "men t shirt",
    "women kurti",
    "running shoes men",
    "sneakers women",
    "casual shirts men",
    "jeans men slim fit",
    "backpack",
    "sunglasses men",
    "watches for men",
    "handbag women",
  ],
  "Home & Kitchen": [
    "mixer grinder",
    "electric kettle",
    "induction cooktop",
    "non stick cookware set",
    "bedsheet double bed",
    "vacuum cleaner",
    "water bottle steel",
    "storage container set",
    "wall clock",
    "led bulb pack",
  ],
  Books: [
    "bestseller novels",
    "self help books",
    "business books",
    "fiction paperback",
    "rich dad poor dad",
    "atomic habits",
    "children story books",
    "competitive exam books",
  ],
  Sports: [
    "yoga mat",
    "dumbbells set",
    "skipping rope",
    "cricket bat",
    "football",
    "badminton racket",
    "resistance bands",
    "running shoes",
    "cycling gloves",
    "gym gloves",
  ],
};

export type NormalizedProduct = {
  title: string;
  image_url: string | null;
  current_price: number | null;
  original_price: number | null;
  discount_percentage: number | null;
  category: string;
  clean_amazon_url: string;
};

function pickNumber(...vals: any[]): number | null {
  for (const v of vals) {
    if (v == null) continue;
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string") {
      const n = parseFloat(v.replace(/[^0-9.]/g, ""));
      if (!Number.isNaN(n)) return n;
    }
    if (typeof v === "object") {
      const n = pickNumber(v.amount, v.value, v.price, v.current_price);
      if (n != null) return n;
    }
  }
  return null;
}

function inferCategory(title: string): Category {
  const t = title.toLowerCase();
  if (/(book|novel|kindle edition|paperback|hardcover|textbook|author|magazine)/.test(t)) return "Books";
  if (/(yoga|dumbbell|treadmill|bike|bicycle|tennis|football|cricket|basketball|gym|fitness|running|sport|cycling|protein|workout|hiking|camping|fishing)/.test(t)) return "Sports";
  if (/(kitchen|cookware|blender|mixer|grinder|oven|microwave|fridge|vacuum|sofa|mattress|pillow|bedsheet|curtain|lamp|cooker|pan|knife|utensil|home|decor|cleaner|iron|fan|heater|air purifier|toaster|kettle)/.test(t)) return "Home & Kitchen";
  if (/(shirt|t-shirt|jean|dress|shoe|sneaker|jacket|watch|bag|backpack|hoodie|wallet|sunglass|saree|kurta|jewel|ring|necklace|bracelet|handbag|perfume|cologne|apparel|fashion|cap|hat|belt)/.test(t)) return "Fashion";
  if (/(drone|robot|smart home|alexa|echo|hub|sensor|tracker|gimbal|3d printer|smartwatch|fitbit|virtual reality|vr headset|gadget)/.test(t)) return "Gadgets";
  return "Electronics";
}

function isUnavailable(raw: RawDeal): boolean {
  const fields = [
    raw.product_availability,
    raw.availability,
    raw.product_availability_status,
    raw.status,
    raw.stock_status,
  ];
  for (const f of fields) {
    if (!f) continue;
    const s = String(f).toLowerCase();
    if (
      s.includes("unavailable") ||
      s.includes("out of stock") ||
      s.includes("currently not available") ||
      s.includes("sold out")
    ) {
      return true;
    }
  }
  if (raw.is_available === false || raw.in_stock === false) return true;
  return false;
}

export function normalizeDeal(raw: RawDeal, forcedCategory?: Category): NormalizedProduct | null {
  if (isUnavailable(raw)) return null;

  const title: string = raw.deal_title || raw.product_title || raw.title || raw.name || "Untitled deal";
  const image: string | null = raw.deal_photo || raw.product_photo || raw.image || raw.image_url || raw.thumbnail || null;
  const url: string | null = raw.deal_url || raw.product_url || raw.url || raw.link || null;

  const current = pickNumber(
    raw.product_price,
    raw.current_price,
    raw.price,
    raw.sale_price,
    raw.deal_price,
    raw.product_minimum_offer_price,
  );
  const original = pickNumber(raw.list_price, raw.original_price, raw.product_original_price, raw.was_price, raw.msrp);

  // Hard requirement: price must be a real positive number.
  if (current == null || current <= 0) return null;

  let discount: number | null = null;
  if (typeof raw.savings_percentage === "number") discount = Math.round(raw.savings_percentage);
  else if (typeof raw.deal_badge === "string") {
    const m = raw.deal_badge.match(/(\d+)%/);
    if (m) discount = parseInt(m[1], 10);
  } else if (current != null && original != null && original > current) {
    discount = Math.round(((original - current) / original) * 100);
  }

  const asin = raw.asin || raw.product_asin || extractAsin(url);
  const clean = buildCleanAmazonUrl(url, asin);
  if (!clean || !title) return null;

  return {
    title: String(title).slice(0, 500),
    image_url: image,
    current_price: current,
    original_price: original,
    discount_percentage: discount,
    category: forcedCategory ?? inferCategory(title),
    clean_amazon_url: clean,
  };
}

async function fetchSearchPage(host: string, apiKey: string, query: string, page: number): Promise<RawDeal[]> {
  const url = `https://${host}/search?query=${encodeURIComponent(query)}&country=IN&page=${page}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": host },
  });
  if (!res.ok) {
    if (page > 1) return [];
    const body = await res.text();
    throw new Error(`RapidAPI search failed page=${page}: ${res.status} ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  const list = json?.data?.products || json?.data?.deals || json?.data || json?.products || [];
  return Array.isArray(list) ? list : [];
}

async function fetchDealsPage(host: string, apiKey: string, page: number): Promise<RawDeal[]> {
  const url = `https://${host}/deals-v2?country=IN&min_product_star_rating=ALL&price_range=ALL&discount_range=ALL&page=${page}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": host },
  });
  if (!res.ok) {
    if (page > 1) return [];
    const body = await res.text();
    throw new Error(`RapidAPI deals failed page=${page}: ${res.status} ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  const list = json?.data?.deals || json?.data?.products || json?.data || json?.deals || json?.products || [];
  return Array.isArray(list) ? list : [];
}

function getEnv() {
  const apiKey = process.env.RAPIDAPI_KEY;
  const host = process.env.RAPIDAPI_HOST || "real-time-amazon-data.p.rapidapi.com";
  if (!apiKey) throw new Error("RAPIDAPI_KEY is not configured");
  return { apiKey, host };
}

// Prices come back in INR directly from Amazon.in (country=IN).
// Loosened: keep anything with a real positive price; previous narrow band
// (₹99–₹2000) was hiding most synced products.
const INR_MIN = 1;
const INR_MAX = 200000;

function priceOk(p: NormalizedProduct) {
  return p.current_price != null && p.current_price >= INR_MIN && p.current_price <= INR_MAX;
}

/** Global FIFO cap: keep at most MAX_TOTAL products in the table. */
export const MAX_TOTAL_PRODUCTS = 25000;

export async function enforceGlobalCap(supabaseAdmin: any, max = MAX_TOTAL_PRODUCTS) {
  const { count } = await supabaseAdmin
    .from("amazon_products")
    .select("id", { count: "exact", head: true });
  const total = count ?? 0;
  const overflow = total - max;
  if (overflow <= 0) return { removed: 0, total };
  const { data: oldest } = await supabaseAdmin
    .from("amazon_products")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(overflow);
  const ids = (oldest ?? []).map((r: any) => r.id);
  if (ids.length === 0) return { removed: 0, total };
  await supabaseAdmin.from("amazon_products").delete().in("id", ids);
  return { removed: ids.length, total };
}

/**
 * Fetch up to `target` unique products for ONE category by fanning out across
 * many queries and paginating each. Stops as soon as `target` is hit.
 */
export async function fetchCategoryProducts(category: Category, target = 200): Promise<{
  products: NormalizedProduct[];
  fetched: number;
}> {
  const { apiKey, host } = getEnv();
  const queries = CATEGORY_QUERIES[category];
  const MAX_PAGES_PER_QUERY = 5;

  const seen = new Set<string>();
  const out: NormalizedProduct[] = [];
  let fetched = 0;

  outer: for (const query of queries) {
    for (let p = 1; p <= MAX_PAGES_PER_QUERY && out.length < target; p++) {
      let list: RawDeal[] = [];
      try {
        list = await fetchSearchPage(host, apiKey, query, p);
      } catch (e) {
        if (p === 1 && out.length === 0 && query === queries[0]) throw e;
        break;
      }
      if (list.length === 0) break;
      fetched += list.length;

      for (const raw of list) {
        const n = normalizeDeal(raw, category);
        if (!n) continue;
        if (seen.has(n.clean_amazon_url)) continue;
        if (!priceOk(n)) continue;
        seen.add(n.clean_amazon_url);
        out.push(n);
        if (out.length >= target) break outer;
      }
    }
  }

  return { products: out, fetched };
}

/** Legacy: full-multi-category sync from the deals endpoint (kept for the manual admin button). */
export async function fetchAndNormalizeDeals(): Promise<{
  products: NormalizedProduct[];
  fetched: number;
  perCategory: Record<string, number>;
}> {
  const { apiKey, host } = getEnv();
  const PAGES = 5;
  const all: RawDeal[] = [];
  for (let p = 1; p <= PAGES; p++) {
    const list = await fetchDealsPage(host, apiKey, p);
    if (list.length === 0 && p > 1) break;
    all.push(...list);
  }
  if (all.length === 0) throw new Error("RapidAPI returned no deals.");

  const seen = new Set<string>();
  const buckets: Record<string, NormalizedProduct[]> = {};
  for (const cat of CATEGORIES) buckets[cat] = [];

  for (const raw of all) {
    const n = normalizeDeal(raw);
    if (!n) continue;
    if (seen.has(n.clean_amazon_url)) continue;
    if (!priceOk(n)) continue;
    seen.add(n.clean_amazon_url);
    buckets[n.category].push(n);
  }

  const PER_CAT_CAP = 30;
  const products: NormalizedProduct[] = [];
  for (const cat of CATEGORIES) products.push(...buckets[cat].slice(0, PER_CAT_CAP));

  const perCategory: Record<string, number> = {};
  for (const p of products) perCategory[p.category] = (perCategory[p.category] ?? 0) + 1;

  return { products, fetched: all.length, perCategory };
}
