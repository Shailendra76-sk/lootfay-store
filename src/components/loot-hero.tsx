import { useEffect, useState } from "react";
import { withAffiliateTag } from "@/lib/affiliate";
import { formatMoney, useSettings } from "@/lib/settings";
import { Flame, Clock } from "lucide-react";

type P = {
  id: string;
  title: string;
  image_url: string | null;
  current_price: number | null;
  original_price: number | null;
  discount_percentage: number | null;
  clean_amazon_url: string;
};

function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const ms = Math.max(0, end.getTime() - now);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { h, m, s };
}

export function LootHero({ products }: { products: P[] }) {
  const { currency } = useSettings();
  const top = [...products]
    .sort((a, b) => (b.discount_percentage ?? 0) - (a.discount_percentage ?? 0))
    .slice(0, 3);
  const [idx, setIdx] = useState(0);
  const { h, m, s } = useCountdown();

  useEffect(() => {
    if (top.length === 0) return;
    const i = setInterval(() => setIdx((v) => (v + 1) % top.length), 4500);
    return () => clearInterval(i);
  }, [top.length]);

  if (top.length === 0) return null;
  const p = top[idx];

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6">
      <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card/80 to-discount/15 backdrop-blur p-6 md:p-8">
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-discount/20 blur-3xl" />
        <div className="relative grid md:grid-cols-[1fr_320px] gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-discount text-discount-foreground text-xs font-bold uppercase tracking-wider">
              <Flame className="size-3.5" /> Loot of the Day
            </div>
            <h2 className="mt-4 text-2xl md:text-4xl font-semibold leading-tight line-clamp-2">
              {p.title}
            </h2>
            <div className="mt-4 flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold text-primary">
                {formatMoney(p.current_price, currency)}
              </span>
              {p.original_price && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatMoney(p.original_price, currency)}
                </span>
              )}
              {p.discount_percentage != null && (
                <span className="px-2.5 py-1 rounded-md bg-discount text-discount-foreground text-sm font-bold">
                  -{p.discount_percentage}%
                </span>
              )}
            </div>
            <div className="mt-5 flex items-center gap-4 flex-wrap">
              <a
                href={withAffiliateTag(p.clean_amazon_url)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold px-5 py-3 shadow-lg shadow-primary/30 hover:brightness-110 transition"
              >
                Grab this loot
              </a>
              <div className="inline-flex items-center gap-2 text-sm font-mono bg-background/60 border border-border rounded-lg px-3 py-2">
                <Clock className="size-4 text-primary" />
                <span>
                  Ends in {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:
                  {String(s).padStart(2, "0")}
                </span>
              </div>
              <div className="flex gap-1.5 ml-auto">
                {top.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    aria-label={`Show deal ${i + 1}`}
                    className={`size-2 rounded-full transition ${
                      i === idx ? "bg-primary w-6" : "bg-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-2xl shadow-primary/20">
            {p.image_url && (
              <img
                src={p.image_url}
                alt={p.title}
                className="absolute inset-0 size-full object-contain p-6 animate-fade-in"
                key={p.id}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
