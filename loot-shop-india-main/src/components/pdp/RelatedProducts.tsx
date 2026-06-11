import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { getRelatedProducts } from "@/lib/related-products.functions";
import { ProductCard, Product } from "@/components/product-card";

type RelatedProduct = Product & { slug: string };

export function RelatedProducts({
  productId,
  category,
}: {
  productId: string;
  category: string | null;
}) {
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchRelated = useServerFn(getRelatedProducts);

  useEffect(() => {
    fetchRelated({ data: { productId, category } })
      .then((res) => {
        setRelated(res || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId, category, fetchRelated]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-6">Related Deals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (related.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 border-t border-border mt-8">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        🔥 Related Deals You Might Like
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {related.map((product) => (
          <Link key={product.id} to="/product/$slug" params={{ slug: product.slug }}>
            <ProductCard product={product} />
          </Link>
        ))}
      </div>
    </div>
  );
}
