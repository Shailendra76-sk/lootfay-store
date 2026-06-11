import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type Product } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { Smartphone, Headphones, Shirt, Home, Sparkles, Tag } from "lucide-react";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — LootBazaar India Deals" },
      { name: "description", content: "Browse Amazon India loot deals by category — Electronics, Fashion, Home, Gadgets and more, refreshed daily." },
      { property: "og:title", content: "Categories — LootBazaar India Deals" },
      { property: "og:description", content: "Browse Amazon India loot deals by category — Electronics, Fashion, Home, Gadgets and more." },
      { property: "og:url", content: "https://loot-shop-india.lovable.app/categories" },
    ],
    links: [{ rel: "canonical", href: "https://loot-shop-india.lovable.app/categories" }],
  }),
  component: CategoriesPage,
});

const CATS = [
  { key: "All", label: "All Deals", Icon: Sparkles, match: () => true },
  { key: "Electronics", label: "Electronics", Icon: Smartphone, match: (p: Product) => (p.category ?? "").toLowerCase() === "electronics" },
  { key: "Gadgets", label: "Gadgets & Audio", Icon: Headphones, match: (p: Product) => /headphone|earbud|earphone|airdopes|buds|watch|gadget/i.test(p.title) || (p.category ?? "").toLowerCase() === "gadgets" },
  { key: "Fashion", label: "Fashion", Icon: Shirt, match: (p: Product) => (p.category ?? "").toLowerCase() === "fashion" },
  { key: "Home", label: "Home & Kitchen", Icon: Home, match: (p: Product) => (p.category ?? "").toLowerCase().includes("home") || (p.category ?? "").toLowerCase().includes("kitchen") },
] as const;

function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<(typeof CATS)[number]["key"]>("All");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("amazon_products")
        .select("*")
        .order("discount_percentage", { ascending: false, nullsFirst: false })
        .limit(2000);
      if (!mounted) return;
      setProducts((data ?? []) as Product[]);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const cat = CATS.find((c) => c.key === active)!;
    return products.filter(cat.match);
  }, [products, active]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-4 pt-8 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold">Shop by Category</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Filter today's hand-picked Amazon India loots by what you love.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CATS.map(({ key, label, Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition ${
                  isActive
                    ? "bg-[#FEB069] text-black border-[#FEB069] shadow-lg shadow-[#FEB069]/20"
                    : "bg-card/60 border-border hover:border-primary/50"
                }`}
              >
                <Icon className="size-6" />
                <span className="text-xs font-semibold text-center">{label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-6">
        <div className="mb-3 text-sm text-muted-foreground">
          Showing <span className="text-foreground font-semibold">{loading ? "…" : filtered.length}</span> deals in{" "}
          <span className="text-[#FEB069] font-semibold">{CATS.find((c) => c.key === active)!.label}</span>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-card border border-border h-80 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <div className="mx-auto size-12 rounded-full bg-card grid place-items-center mb-4">
              <Tag className="size-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">No deals in this category right now</h3>
            <p className="text-sm text-muted-foreground mt-1">Check back soon — feed refreshes daily.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.slice(0, 60).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
      <WhatsAppFab />
    </div>
  );
}
