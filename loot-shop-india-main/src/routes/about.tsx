import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { DonationCard } from "@/components/donation-card";
import { Mail, MessageCircle, Instagram, Send, ShieldCheck } from "lucide-react";

const EMAIL = "dubeyabhinash98@gmail.com";
const WA = "https://whatsapp.com";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Contact — LootBazaar.in" },
      { name: "description", content: "Get in touch with LootBazaar.in. Support email, UPI donation QR, WhatsApp channel and social handles for daily Amazon India loot deals." },
      { property: "og:title", content: "About & Contact — LootBazaar.in" },
      { property: "og:description", content: "Support email, UPI donation QR, WhatsApp channel and social handles." },
      { property: "og:url", content: "https://loot-shop-india.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://loot-shop-india.lovable.app/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-4xl px-4 pt-10 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          About LootBazaar.in
        </h1>
        <p className="mt-3 text-muted-foreground">
          LootBazaar.in is a hand-picked, automatically refreshed feed of the best
          budget deals on Amazon India. Our goal is simple: help you find genuinely
          good loots without scrolling through endless fake discounts.
        </p>

        <div className="mt-6 rounded-xl border border-border bg-card/60 p-4 flex items-start gap-3">
          <ShieldCheck className="size-5 text-[#FEB069] shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Amazon Associates Disclosure:</strong>{" "}
            LootBazaar.in is a participant in the Amazon Services LLC Associates
            Program. As an Amazon Associate we earn from qualifying purchases at
            no extra cost to you. Affiliate commissions help us keep the lights on.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-12 grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-5">
          <h2 className="font-semibold text-lg">Contact & Support</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Spotted a broken link? Want a deal featured? Drop us a line.
          </p>

          <a
            href={`mailto:${EMAIL}`}
            className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Mail className="size-4" /> {EMAIL}
          </a>

          <div className="mt-5 space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Follow Us</div>
            <div className="flex flex-wrap gap-2">
              <a
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:brightness-110"
              >
                <MessageCircle className="size-4" /> WhatsApp Channel
              </a>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#229ED9] text-white text-sm font-semibold hover:brightness-110"
              >
                <Send className="size-4" /> Telegram
              </a>
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-white text-sm font-semibold hover:brightness-110"
              >
                <Instagram className="size-4" /> Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-5">
          <h2 className="font-semibold text-lg">Support the Creator</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            LootBazaar runs on hand-curation + API costs. A small UPI tip keeps the feed alive ☕
          </p>
          <DonationCard />
        </div>
      </section>

      <SiteFooter />
      <WhatsAppFab />
    </div>
  );
}
