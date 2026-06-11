import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MessageCircle, Send, Facebook, Link2, Check, Sparkles, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { generateShareMessage } from "@/lib/ai-captions.functions";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productId: string;
  title: string;
  price: number | null;
  url: string;
};

export function ShareDealModal({ open, onOpenChange, productId, title, price, url }: Props) {
  const [copied, setCopied] = useState(false);
  const [aiMsg, setAiMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const gen = useServerFn(generateShareMessage);

  const priceStr = price != null ? `₹${price.toLocaleString("en-IN")}` : "an amazing price";
  const fallback = `🔥 Look at this amazing deal on LootBazaar! ${title} is now available at ${priceStr}.\n\n🛒 ${url}\n\n— LootBazaar.in`;
  const msg = aiMsg ?? fallback;

  useEffect(() => {
    if (!open || aiMsg || loading) return;
    setLoading(true);
    gen({ data: { productId, url } })
      .then((r) => setAiMsg(r.message))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, productId, url, aiMsg, loading, gen]);

  const enc = encodeURIComponent(msg);
  const encUrl = encodeURIComponent(url);
  const encTitle = encodeURIComponent(`${title} — LootBazaar`);

  const wa = `https://wa.me/?text=${enc}`;
  const tg = `https://t.me/share/url?url=${encUrl}&text=${enc}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encUrl}&quote=${enc}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(msg);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this Loot 🔥</DialogTitle>
          <DialogDescription className="line-clamp-2">{title}</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs whitespace-pre-line max-h-40 overflow-y-auto">
          <div className="flex items-center gap-1.5 text-primary font-semibold mb-1.5">
            <Sparkles className="size-3.5" />
            AI-generated message
            {loading && <Loader2 className="size-3 animate-spin ml-auto" />}
          </div>
          {msg}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold text-sm transition"
          >
            <MessageCircle className="size-4" /> WhatsApp
          </a>
          <a
            href={tg}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-[#229ED9] hover:bg-[#1a7fb0] text-white font-semibold text-sm transition"
          >
            <Send className="size-4" /> Telegram
          </a>
          <a
            href={fb}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-[#1877F2] hover:bg-[#0d5fcc] text-white font-semibold text-sm transition"
          >
            <Facebook className="size-4" /> Facebook
          </a>
          <button
            type="button"
            onClick={copy}
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-card border border-border hover:border-primary/60 text-foreground font-semibold text-sm transition"
          >
            {copied ? <Check className="size-4 text-primary" /> : <Link2 className="size-4" />}
            {copied ? "Copied!" : "Copy Message"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
