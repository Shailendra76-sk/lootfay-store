import { useEffect, useRef, useState } from "react";
import { ExternalLink, Tag, Bell, Flame, Share2, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { withAffiliateTag } from "@/lib/affiliate";
import { formatMoney, savingsInr, useSettings } from "@/lib/settings";
import { generateProductCaption } from "@/lib/ai-captions.functions";
import { generateSlug } from "@/lib/slug";
import { PriceAlertModal } from "./price-alert-modal";
import { ShareDealModal } from "./share-deal-modal";

export type Product = {
  id: string;
  title: string;
  image_url: string | null;
  current_price: number | null;
  original_price: number | null;
  discount_percentage: number | null;
  category: string | null;
  clean_amazon_url: string;
  ai_caption?: string | null;
};

export function ProductCard({ product }: { product: Product }) {
  const { currency } = useSettings();
  const [alertOpen, setAlertOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [caption, setCaption] = useState<string | null>(product.ai_caption ?? null);
  const articleRef = useRef<HTMLElement>(null);
  const genCaption = useServerFn(generateProductCaption);
  const href = withAffiliateTag(product.clean_amazon_url);
  const discount = product.discount_percentage ?? 0;
  const isSuper = discount > 60;

  // Lazy-generate AI caption when card scrolls into view (once per product).
  useEffect(() => {
    if (caption || !articleRef.current) return;
    const el = articleRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          genCaption({ data: { productId: product.id } })
            .then((r) => setCaption(r.caption))
            .catch(() => {});
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [product.id, caption, genCaption]);

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const productSlug = generateSlug(product.title, product.id);

  return (
    <>
      <article
        ref={articleRef}
        className={`group relative rounded-xl overflow-hidden bg-card/80 backdrop-blur border transition-all hover:-translate-y-0.5 flex flex-col ${
          isSuper
            ? "border-primary/60 shadow-xl shadow-primary/20 animate-glow-super"
            : "border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
        }`}
      >
        {/* Top-right action cluster (highest z-index) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              setShareOpen(true);
            }}
            aria-label="Share this deal"
            className="size-8 grid place-items-center rounded-full bg-background/90 backdrop-blur border border-border hover:bg-primary hover:text-primary-foreground transition shadow"
          >
            <Share2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              setAlertOpen(true);
            }}
            aria-label="Set price drop alert"
            className="size-8 grid place-items-center rounded-full bg-background/90 backdrop-blur border border-border hover:bg-primary hover:text-primary-foreground transition shadow"
          >
            <Bell className="size-4" />
          </button>
        </div>

        {/* Clickable area linking to PDP for SEO */}
        <Link
          to="/product/$slug"
          params={{ slug: productSlug }}
          className="relative z-10 flex flex-col flex-1 pointer-events-auto"
        >
          <div className="relative aspect-square bg-white">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                loading="lazy"
                className="absolute inset-0 size-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-muted-foreground">
                <Tag className="size-8" />
              </div>
            )}
            {discount > 0 && (
              <div className="absolute top-3 left-3 bg-discount text-discount-foreground text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                -{discount}%
              </div>
            )}
            {isSuper && (
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider shadow">
                Super Deal
              </div>
            )}
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{product.title}</h3>
            {caption && (
              <div className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-foreground/80 bg-primary/5 border border-primary/20 rounded-md px-2 py-1.5">
                <Sparkles className="size-3 text-primary shrink-0 mt-0.5" />
                <span className="line-clamp-2">{caption}</span>
              </div>
            )}
            <div className="mt-3 flex items-baseline gap-2 flex-wrap">
              <span className="text-lg font-semibold text-primary">
                {formatMoney(product.current_price, currency)}
              </span>
              {product.original_price != null &&
                product.current_price != null &&
                product.original_price > product.current_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatMoney(product.original_price, currency)}
                  </span>
                )}
            </div>
            {(() => {
              const saved = savingsInr(product.current_price, product.original_price);
              if (!saved && discount < 10) return null;
              return (
                <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-discount">
                  <Flame className="size-3" />
                  <span>
                    {saved
                      ? `Price Dropped · Save ₹${saved.toLocaleString("en-IN")}`
                      : `🔥 Price Dropped -${discount}%`}
                  </span>
                </div>
              );
            })()}

            {/* Prominent CTA linking to PDP to ensure SEO pageview before Amazon redirect */}
            <div className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#FEB069] group-hover:bg-[#ffa04f] text-black font-bold py-2.5 text-sm shadow-lg shadow-[#FEB069]/20 transition relative z-10">
              View Deal on Amazon
              <ExternalLink className="size-3.5" />
            </div>
          </div>
        </Link>
      </article>
      <PriceAlertModal open={alertOpen} onOpenChange={setAlertOpen} productTitle={product.title} />
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
