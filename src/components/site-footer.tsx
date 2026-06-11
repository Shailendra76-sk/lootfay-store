import { Mail, MessageCircle } from "lucide-react";
import { DonationCard } from "./donation-card";

const WA_URL = "https://whatsapp.com";
const EMAIL = "dubeyabhinash98@gmail.com";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40 backdrop-blur mt-12">
      <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="font-semibold text-lg">
            <span className="text-[#FEB069]">Loot</span>
            <span className="text-foreground">Bazaar.in</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Real-time multi-platform deals, hand-picked & refreshed daily. As an Amazon Associate
            we earn from qualifying purchases.
          </p>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-[#25D366] hover:underline"
          >
            <MessageCircle className="size-4" /> Join WhatsApp Channel
          </a>
        </div>
        <div>
          <div className="font-semibold">Contact</div>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
            suppressHydrationWarning
          >
            <Mail className="size-4" />
            <span suppressHydrationWarning>Contact Support: {EMAIL}</span>
          </a>
        </div>
        <div>
          <div className="font-semibold mb-3">Support the Creator (Donate)</div>
          <DonationCard />
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground px-4">
        © {new Date().getFullYear()} LootBazaar.in — As an Amazon Associate, we earn from
        qualifying purchases on Amazon.in.
      </div>
    </footer>
  );
}
