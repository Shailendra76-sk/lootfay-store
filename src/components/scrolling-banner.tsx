import { MessageCircle } from "lucide-react";

const WA_URL = "https://whatsapp.com/channel/0029VbCy92nBadmau8nw0v3j";
const MSG = "🔔 Join our WhatsApp channel for instant 24/7 loot deal alerts! 🔥 Daily Amazon India deals up to 80% OFF — never miss a loot again!";

export function ScrollingBanner() {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full bg-gradient-to-r from-[#128C7E] via-[#25D366] to-[#128C7E] text-white overflow-hidden hover:brightness-110 transition"
    >
      <div className="flex items-center gap-3 py-1.5 text-xs sm:text-sm font-semibold">
        <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 ml-2 rounded-full bg-white/20 backdrop-blur uppercase tracking-wider text-[10px]">
          <MessageCircle className="size-3.5" /> Live
        </span>
        <div className="overflow-hidden flex-1 relative">
          <div className="flex gap-16 whitespace-nowrap animate-ticker">
            <span>{MSG}</span>
            <span>{MSG}</span>
            <span>{MSG}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
