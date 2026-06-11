import { createFileRoute, notFound } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { extractIdFromSlug, generateSlug } from "@/lib/slug";
import { generateSEOTags, generateProductJSONLD } from "@/lib/seo";
import { ProductPDP } from "@/components/pdp/ProductPDP";
import { RelatedProducts } from "@/components/pdp/RelatedProducts";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const productId = extractIdFromSlug(params.slug);
    if (!productId) {
      throw notFound();
    }

    const { data: product, error } = await supabaseAdmin
      .from("amazon_products")
      .select(
        "id, title, image_url, current_price, original_price, discount_percentage, category, clean_amazon_url, ai_caption",
      )
      .eq("id", productId)
      .single();

    if (error || !product) {
      throw notFound();
    }

    // Redirect to canonical slug if the provided slug doesn't match the generated one
    const canonicalSlug = generateSlug(product.title, product.id);
    if (params.slug !== canonicalSlug) {
      throw new Response(null, {
        status: 301,
        headers: {
          Location: `/product/${canonicalSlug}`,
        },
      });
    }

    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.product) return {};
    const product = loaderData.product;
    const url = `https://lootbazaar.in/product/${generateSlug(product.title, product.id)}`;

    const seo = generateSEOTags({
      title: `${product.title} Deal, Price & Discount`,
      description: `Latest ${product.title} deal, discount, price comparison and Amazon offer. Grab the best price today on LootBazaar.`,
      image: product.image_url || undefined,
      url,
      type: "product",
    });

    const jsonLd = generateProductJSONLD({
      title: product.title,
      image: product.image_url,
      current_price: product.current_price,
      original_price: product.original_price,
      clean_amazon_url: product.clean_amazon_url,
      id: product.id,
    });

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        ...seo.meta,
      ],
      links: seo.link,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
      ],
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { product } = Route.useLoaderData();

  return (
    <main className="min-h-screen bg-background">
      <ProductPDP product={product} />
      <RelatedProducts productId={product.id} category={product.category} />
    </main>
  );
}
