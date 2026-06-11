import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Tag, X } from "lucide-react";
import { ScrollingBanner } from "@/components/scrolling-banner";
import { LootHero } from "@/components/loot-hero";
import { ProductCard, type Product } from "@/components/product-card";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { SiteFooter } from "@/components/site-footer";
import { fuzzySuggest, fuzzyScore } from "@/lib/fuzzy";
import type { FeaturedFilter } from "@/components/featured-grid";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LootBazaar — Daily Amazon India Loots & Budget Deals" },
      {
        name: "description",
        content:
          "Hand-picked budget-friendly Amazon India deals across Electronics, Gadgets, Fashion and Home Essentials — refreshed daily.",
      },
      { property: "og:title", content: "LootBazaar — Daily Amazon India Loots & Budget Deals" },
      {
        property: "og:description",
        content:
          "Hand-picked budget-friendly Amazon India deals across Electronics, Gadgets, Fashion and Home Essentials — refreshed daily.",
      },
      { property: "og:url", content: "https://loot-shop-india.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://loot-shop-india.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Today's Top Budget Loots on Amazon India",
          url: "https://loot-shop-india.lovable.app/",
          description:
            "Live feed of hand-picked Amazon India deals across Electronics, Gadgets, Fashion and Home Essentials.",
        }),
      },
    ],
  }),
  component: Storefront,
});

const NAV_CHIPS = [
  { label: "🛍️ All Products", filter: { all: true } as const },
  { label: "📱 Electronics", filter: { category: "Electronics" } as const },
  { label: "🎧 Gadgets", filter: { category: "Gadgets" } as const },
  { label: "👟 Fashion", filter: { category: "Fashion" } as const },
  { label: "🏠 Home Essentials", filter: { category: "Home & Kitchen" } as const },
  { label: "🎁 Best Offers", filter: { sort: "discount" } as const },
];

const PAGE_SIZE = 24;

type ActiveFilter = FeaturedFilter & { all?: boolean; label?: string };

function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [active, setActive] = useState<ActiveFilter>({ all: true, label: "All Products" });
  const [page, setPage] = useState(1);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("amazon_products")
        .select("*")
        .order("created_at", { ascending: false, nullsFirst: false })
        .limit(2000);
      if (!mounted) return;
      setProducts((data ?? []) as Product[]);
      setLoading(false);
    };
    load();
    const channel = supabase
      .channel("amazon_products_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "amazon_products" }, () => load())
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => setPage(1), [active, query]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!searchWrapRef.current?.contains(e.target as Node)) setShowSuggest(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const suggestions = useMemo(
    () => (query.trim().length >= 2 ? fuzzySuggest(query, products, 5) : []),
    [query, products],
  );

  const filtered = useMemo(() => {
    let list = products;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list
        .map((p) => ({ p, s: fuzzyScore(q, p.title) }))
        .filter((x) => x.s != null)
        .sort((a, b) => (a.s as number) - (b.s as number))
        .map((x) => x.p);
    }
    if (active.category) {
      list = list.filter((p) => (p.category ?? "").toLowerCase() === active.category!.toLowerCase());
    }
    if (active.keywords?.length) {
      const ks = active.keywords.map((k) => k.toLowerCase());
      list = list.filter((p) => ks.some((k) => p.title.toLowerCase().includes(k)));
    }
    if (active.sort === "discount") {
      list = [...list].sort((a, b) => (b.discount_percentage ?? 0) - (a.discount_percentage ?? 0));
    } else if (active.sort === "price-asc") {
      list = [...list].sort((a, b) => (a.current_price ?? 9e9) - (b.current_price ?? 9e9));
    }
    return list;
  }, [products, query, active]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const applyChip = (filter: ActiveFilter, label: string) => {
    setActive({ ...filter, label });
    setQuery("");
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  const isChipActive = (chipFilter: any) => {
    if (chipFilter.all && active.all) return true;
    if (chipFilter.category && chipFilter.category === active.category) return true;
    if (chipFilter.sort && chipFilter.sort === active.sort && !active.category) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollingBanner />

      {/* Hero / heading + Smart Search */}
      <section className="mx-auto max-w-7xl px-4 pt-6 pb-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Daily Amazon India Loots & Budget Deals
        </h1>
        <p className="mt-2 text-xs md:text-sm text-muted-foreground max-w-3xl">
          <strong className="text-foreground/80">Affiliate disclosure:</strong> LootBazaar.in is a participant in the Amazon Associates Program.
          As an Amazon Associate we earn from qualifying purchases — at no extra cost to you.
        </p>

        <div ref={searchWrapRef} className="relative mt-5 max-w-3xl">
          <div className="flex items-stretch rounded-md overflow-hidden shadow-md ring-1 ring-border focus-within:ring-2 focus-within:ring-[#FEB069] bg-white">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggest(true);
              }}
              onFocus={() => setShowSuggest(true)}
              placeholder="Smart Search — try 'bote earbds', 'smarwach', 'iphne'…"
              className="flex-1 px-4 py-2.5 text-sm bg-white text-black placeholder:text-neutral-500 outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear" className="px-2 bg-white text-neutral-500 hover:text-black">
                <X className="size-4" />
              </button>
            )}
            <button aria-label="Search" className="px-4 bg-[#FEB069] hover:bg-[#ffa04f] text-black grid place-items-center">
              <Search className="size-5" />
            </button>
          </div>
          {showSuggest && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white text-black rounded-md shadow-2xl border border-border z-40 overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setQuery(s.title);
                    setShowSuggest(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 flex items-center gap-2 border-b last:border-b-0"
                >
                  <Search className="size-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{s.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chips */}
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {NAV_CHIPS.map((c) => {
            const isActive = isChipActive(c.filter);
            return (
              <button
                key={c.label}
                onClick={() => applyChip(c.filter as ActiveFilter, c.label)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition whitespace-nowrap ${
                  isActive
                    ? "bg-[#FEB069] text-black border-[#FEB069] shadow"
                    : "bg-card/60 text-foreground border-border hover:border-[#FEB069]/60"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </section>

      {!loading && products.length > 0 && <LootHero products={products} />}

      <section className="mx-auto max-w-7xl px-4 pt-6 pb-2 flex items-center gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-foreground">Today's Top Budget Loots</h2>
        <div className="text-sm text-muted-foreground">
          Showing <span className="text-foreground font-semibold">{loading ? "…" : filtered.length} deals</span> ·{" "}
          <span className="text-[#FEB069]">{active.label}</span>
        </div>
        {!active.all && (
          <button
            onClick={() => setActive({ all: true, label: "All Products" })}
            className="text-xs px-2.5 py-1 rounded-full border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition"
          >
            Clear filter ×
          </button>
        )}
      </section>

      <main className="mx-auto max-w-7xl px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-card border border-border h-80 animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-lg bg-card border border-border text-sm disabled:opacity-40 hover:border-primary/50"
                >
                  ← Prev
                </button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded-lg bg-card border border-border text-sm disabled:opacity-40 hover:border-primary/50"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <SiteFooter />
      <WhatsAppFab />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border p-12 text-center">
      <div className="mx-auto size-12 rounded-full bg-card grid place-items-center mb-4">
        <Tag className="size-5 text-muted-foreground" />
      </div>
      <h3 className="font-semibold">No deals match this filter</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Try a different category, or head to{" "}
        <a className="text-primary underline" href="/admin">/admin</a> and click <strong>Sync Now</strong> to refresh the feed.
      </p>
    </div>
  );
}
