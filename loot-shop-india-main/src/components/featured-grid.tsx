import { Home, Headphones, Sparkles, Zap, type LucideIcon } from "lucide-react";

type Block = {
  title: string;
  subtitle: string;
  bg: string;
  Icon: LucideIcon;
  filter: { category?: string; keywords?: string[]; sort?: "discount" | "price-asc" };
};

const BLOCKS: Block[] = [
  {
    title: "Appliances for your home",
    subtitle: "Up to 55% off",
    bg: "from-orange-500/30 to-pink-500/20",
    Icon: Home,
    filter: { category: "Home & Kitchen" },
  },
  {
    title: "Deals on Headphones & Earbuds",
    subtitle: "Up to 75% off",
    bg: "from-indigo-500/30 to-purple-500/20",
    Icon: Headphones,
    filter: { keywords: ["headphone", "earbud", "earphone", "airdopes", "buds"] },
  },
  {
    title: "Home Essentials",
    subtitle: "Starting ₹49",
    bg: "from-emerald-500/30 to-cyan-500/20",
    Icon: Sparkles,
    filter: { sort: "price-asc" },
  },
  {
    title: "Trending Tech & Gadgets",
    subtitle: "Hot Loot",
    bg: "from-amber-500/30 to-red-500/20",
    Icon: Zap,
    filter: { category: "Electronics" },
  },
];

export type FeaturedFilter = Block["filter"];

export function FeaturedGrid({ onSelect }: { onSelect: (f: FeaturedFilter, label: string) => void }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {BLOCKS.map((b) => {
          const Icon = b.Icon;
          return (
            <button
              key={b.title}
              onClick={() => onSelect(b.filter, b.title)}
              className={`group relative text-left rounded-2xl border border-border bg-gradient-to-br ${b.bg} bg-card/60 backdrop-blur p-5 aspect-square overflow-hidden hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10 transition`}
            >
              <div className="absolute -bottom-4 -right-4 size-28 rounded-full bg-background/30 backdrop-blur-sm grid place-items-center text-foreground/70 group-hover:scale-110 group-hover:text-primary transition-transform">
                <Icon className="size-14 stroke-[1.25]" />
              </div>
              <div className="relative">
                <div className="inline-flex items-center justify-center size-9 rounded-xl bg-background/50 border border-border/60 text-primary mb-3">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold text-base md:text-lg leading-tight text-foreground">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm text-primary font-medium">{b.subtitle}</p>
                <span className="mt-4 inline-block text-xs text-muted-foreground group-hover:text-primary transition">
                  See all deals →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
