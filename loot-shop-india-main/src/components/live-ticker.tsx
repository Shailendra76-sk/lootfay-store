import { useMemo } from "react";

const ITEMS = [
  "🔥 USER-9420 just grabbed a braided fast-charging cable for ₹149!",
  "⚡ USER-1029 bagged Boat Earbuds at ₹699 — 75% OFF",
  "🎯 USER-7733 snagged Noise Smartwatch for ₹1,299",
  "💥 USER-5512 looted Mi Power Bank at ₹599 (71% OFF)",
  "🚀 USER-9981 grabbed running shoes for ₹899",
  "🛒 USER-3344 saved big on Prestige Mixer at ₹1,499",
  "✨ USER-2210 scored Sony Headphones at ₹1,199",
  "🎉 USER-6677 got a kitchen knife set for ₹299",
  "🎁 USER-4040 looted bedsheet combo at ₹449",
  "🧴 USER-8821 grabbed Mamaearth combo for ₹399",
];

export function LiveTicker() {
  const items = useMemo(() => [...ITEMS, ...ITEMS], []);
  return (
    <div className="w-full bg-gradient-to-r from-primary/20 via-discount/20 to-primary/20 border-b border-border/60 overflow-hidden">
      <div className="flex items-center gap-2 py-1.5 text-xs font-medium">
        <span className="px-3 py-1 rounded-full bg-discount text-discount-foreground shrink-0 text-[10px] uppercase tracking-widest font-bold ml-2">
          Live
        </span>
        <div className="overflow-hidden flex-1 relative">
          <div className="flex gap-8 whitespace-nowrap animate-ticker">
            {items.map((t, i) => (
              <span key={i} className="text-foreground/80">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
