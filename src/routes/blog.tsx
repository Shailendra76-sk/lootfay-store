import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { BookOpen, Sparkles, Wallet, Clock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Smart Shopping Tips & Hacks — LootBazaar Blog" },
      { name: "description", content: "Budget shopping tricks, Amazon India hacks and price-drop hunting tips to help you save more on every purchase." },
      { property: "og:title", content: "Smart Shopping Tips & Hacks — LootBazaar Blog" },
      { property: "og:description", content: "Budget shopping tricks, Amazon India hacks and price-drop hunting tips." },
      { property: "og:url", content: "https://loot-shop-india.lovable.app/blog" },
    ],
    links: [{ rel: "canonical", href: "https://loot-shop-india.lovable.app/blog" }],
  }),
  component: BlogPage,
});

const POSTS = [
  {
    Icon: Wallet,
    title: "5 Hidden Tricks to Spot Real Amazon Deals (and Avoid Fake Discounts)",
    excerpt:
      "Inflated MRPs are everywhere. Use price history tools like Keepa, compare across sellers, and check the Buy Box before you tap pay. Here's the exact 60-second check we run on every deal we list.",
    tag: "Deal Hunting",
  },
  {
    Icon: Clock,
    title: "The Best Times of Day to Catch Lightning Deals on Amazon India",
    excerpt:
      "Lightning deals refresh on a schedule. We tracked 1,000+ deals over 30 days — here are the 3 windows when top loots drop and how to set alerts before they sell out.",
    tag: "Timing",
  },
  {
    Icon: Sparkles,
    title: "Under ₹500 Loot Guide: 12 Genuinely Useful Things Worth Buying",
    excerpt:
      "Not every cheap thing is a loot. We curated a no-junk list of sub-₹500 items — from braided cables to kitchen helpers — that real shoppers rated 4★ and above over 6 months.",
    tag: "Budget Picks",
  },
  {
    Icon: ShieldCheck,
    title: "How to Avoid Counterfeit Sellers on Amazon (Brand Safety 101)",
    excerpt:
      "Look for 'Sold by Cloudtail / Appario / Brand-name', check seller ratings, and use Amazon's A-to-Z guarantee filter. A 5-step checklist for safer purchases on every order.",
    tag: "Safety",
  },
] as const;

function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-4xl px-4 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEB069]/15 text-[#FEB069] text-xs font-semibold mb-3">
          <BookOpen className="size-3.5" /> LootBazaar Tips
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Smart Shopping Tips & Budget Hacks
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Real-world tricks we use every day to spot genuine loots, time lightning deals, and stretch every rupee further on Amazon India.
        </p>
      </section>

      <main className="mx-auto max-w-4xl px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-5">
          {POSTS.map(({ Icon, title, excerpt, tag }) => (
            <article
              key={title}
              className="rounded-xl border border-border bg-card/80 backdrop-blur p-5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition"
            >
              <div className="flex items-center gap-2 text-xs text-[#FEB069] font-semibold uppercase tracking-wider">
                <Icon className="size-3.5" />
                {tag}
              </div>
              <h2 className="mt-3 text-lg font-semibold leading-snug">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{excerpt}</p>
              <div className="mt-4 text-xs text-muted-foreground">
                Full guide coming soon — bookmark and check back.
              </div>
            </article>
          ))}
        </div>
      </main>

      <SiteFooter />
      <WhatsAppFab />
    </div>
  );
}
