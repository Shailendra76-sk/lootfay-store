export const AMAZON_AFFILIATE_TAG = "sk200709-21";
export const FLIPKART_AFFILIATE_TAG = "REPLACE_ME_FLIPKART_ID";

export function extractAsin(url: string | null | undefined): string | null {
  if (!url) return null;
  const m =
    url.match(/\/dp\/([A-Z0-9]{10})/i) ||
    url.match(/\/gp\/product\/([A-Z0-9]{10})/i) ||
    url.match(/\/product\/([A-Z0-9]{10})/i) ||
    url.match(/[?&]asin=([A-Z0-9]{10})/i);
  return m ? m[1].toUpperCase() : null;
}

export function buildCleanAmazonUrl(rawUrl: string | null | undefined, asin?: string | null) {
  const id = asin || extractAsin(rawUrl);
  if (id) return `https://www.amazon.in/dp/${id}`;
  if (rawUrl) {
    try {
      const u = new URL(rawUrl);
      return `${u.origin}${u.pathname}`;
    } catch {
      return rawUrl;
    }
  }
  return "https://www.amazon.in";
}

/**
 * Strip any existing `tag=...` affiliate parameter and append our own.
 * Works whether or not the URL already has a query string.
 */
export function convertToAffiliateUrl(originalUrl: string): string {
  if (!originalUrl) return `https://www.amazon.in/?tag=${AMAZON_AFFILIATE_TAG}`;

  // Remove any existing tag=... param (handles ?tag=..., &tag=..., trailing or mid-query).
  let cleaned = originalUrl
    .replace(/([?&])tag=[^&#]*(&|$)/gi, (_m, p1, p2) => (p2 ? p1 : ""))
    .replace(/[?&]$/, "");

  const sep = cleaned.includes("?") ? "&" : "?";
  return `${cleaned}${sep}tag=${AMAZON_AFFILIATE_TAG}`;
}

/** Append the right affiliate tag based on domain. */
export function withAffiliateTag(cleanUrl: string) {
  try {
    const u = new URL(cleanUrl);
    const host = u.hostname.toLowerCase();
    if (host.includes("amazon.")) {
      u.searchParams.delete("tag");
      u.searchParams.set("tag", AMAZON_AFFILIATE_TAG);
      return u.toString();
    } else if (host.includes("flipkart.") || host.includes("myntra.")) {
      u.searchParams.set("affid", FLIPKART_AFFILIATE_TAG);
      return u.toString();
    }
    return u.toString();
  } catch {
    return convertToAffiliateUrl(cleanUrl);
  }
}
