import { ExternalLink, Tag, Flame, Share2, Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { withAffiliateTag } from "@/lib/affiliate";
import { formatMoney, savingsInr, useSettings } from "@/lib/settings";
import { ShareDealModal } from "@/components/share-deal-modal";
import { useState } from "react";

export type ProductPDPProps = {
  product: {
    id: string;
    title: string;
    image_url: string | null;
    current_price: number | null;
    original_price: number | null;
    discount_percentage: number | null;
    category: string | null;
    clean_amazon_url: string;
    ai_caption?: string | null;
    description?: string | null;
    brand?: string | null;
    rating?: number | null;
  };
};

export function ProductPDP({ product }: ProductPDPProps) {
  const { currency } = useSettings();
  const [shareOpen, setShareOpen] = useState(false);
  const href = withAffiliateTag(product.clean_amazon_url);
  const discount = product.discount_percentage ?? 0;
  const isSuper = discount > 60;
  const saved = savingsInr(product.current_price, product.original_price);

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb / Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Deals
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery Section */}
          <div className="relative bg-white rounded-2xl border border-border p-6 lg:p-10 flex items-center justify-center aspect-square lg:aspect-auto lg:min-h-[500px]">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="max-w-full max-h-full object-contain drop-shadow-lg"
              />
            ) : (
              <div className="grid place-items-center text-muted-foreground">
                <Tag className="size-16" />
              </div>
            )}
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-discount text-discount-foreground text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                -{discount}% OFF
              </div>
            )}
            {isSuper && (
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow">
                Super Deal
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col">
            {product.category && (
              <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                {product.category}
              </span>
            )}
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight mb-4">
              {product.title}
            </h1>

            {product.ai_caption && (
              <div className="flex items-start gap-2 text-sm leading-relaxed text-foreground/80 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mb-6">
                <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                <span>{product.ai_caption}</span>
              </div>
            )}

            <div className="flex items-baseline gap-3 flex-wrap mb-6">
              <span className="text-4xl font-bold text-primary">
                {formatMoney(product.current_price, currency)}
              </span>
              {product.original_price != null &&
                product.current_price != null &&
                product.original_price > product.current_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatMoney(product.original_price, currency)}
                  </span>
                )}
            </div>

            {saved > 0 && (
              <div className="inline-flex items-center gap-2 text-sm font-bold text-discount bg-discount/10 px-3 py-1.5 rounded-md mb-6 w-fit">
                <Flame className="size-4" />
                <span>You Save ₹{saved.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FEB069] hover:bg-[#ffa04f] text-black font-bold py-4 text-lg shadow-lg shadow-[#FEB069]/20 transition transform hover:scale-[1.02]"
              >
                Buy on Amazon
                <ExternalLink className="size-5" />
              </a>
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-semibold py-3 text-base transition"
              >
                <Share2 className="size-4" />
                Share this Deal
              </button>
            </div>

            <div className="border-t border-border pt-6 text-sm text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">Note:</strong> Price and availability are
                subject to change on Amazon. This page contains affiliate links.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ShareDealModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        productId={product.id}
        title={product.title}
        price={product.current_price}
        url={href}
      />
    </>
  );
}
