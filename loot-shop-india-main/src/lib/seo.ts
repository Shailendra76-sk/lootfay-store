export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: "website" | "article" | "product";
}

export function generateSEOTags({ title, description, image, url, type = "website" }: SEOProps) {
  const siteName = "LootBazaar";
  const fullTitle = `${title} | ${siteName}`;
  const defaultImage = "https://lootbazaar.in/og-default.jpg"; // Fallback image

  return {
    title: fullTitle,
    meta: [
      { name: "description", content: description },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:image", content: image || defaultImage },
      { property: "og:site_name", content: siteName },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image || defaultImage },
    ],
    link: [{ rel: "canonical", href: url }],
  };
}

export function generateProductJSONLD(product: {
  title: string;
  image: string | null;
  current_price: number | null;
  original_price: number | null;
  clean_amazon_url: string;
  id: string;
}) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    image: product.image || "https://lootbazaar.in/og-default.jpg",
    offers: {
      "@type": "Offer",
      url: `https://lootbazaar.in/product/${product.id}`, // Simplified for schema
      priceCurrency: "INR",
      price: product.current_price?.toString() || "0",
      availability: "https://schema.org/InStock",
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
    },
  };
}
