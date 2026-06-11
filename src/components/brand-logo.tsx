import { Zap } from "lucide-react";

/**
 * Brand logo wordmark — always renders the SVG/text mark so it never breaks.
 * "Loot" = #FEB069 (Amazon yellow-orange), "Bazaar.in" = white + neon bolt.
 */
export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <a href="/" className={`inline-flex items-center gap-2 shrink-0 ${className}`} aria-label="LootBazaar.in home">
      <span className="relative grid place-items-center size-9 rounded-xl bg-gradient-to-br from-[#FEB069] to-[#ff8a3d] shadow-lg shadow-[#FEB069]/30">
        <Zap className="size-5 text-black" fill="currentColor" />
      </span>
      <span className="text-xl font-extrabold tracking-tight leading-none whitespace-nowrap">
        <span className="text-[#FEB069]">Loot</span>
        <span className="text-white">Bazaar</span>
        <span className="text-[#FEB069]">.in</span>
      </span>
    </a>
  );
}
