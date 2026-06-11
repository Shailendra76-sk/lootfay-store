import { useState } from "react";

const UPI_ID = "7905720648@kotakbank";
// Custom uploaded QR (place file at /public/donation-qr.png). Fallback: auto-generated UPI QR.
const CUSTOM_QR = "/donation-qr.png";
const FALLBACK_QR = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
  `upi://pay?pa=${UPI_ID}&pn=LootBazaar`,
)}`;

export function DonationCard() {
  const [src, setSrc] = useState(CUSTOM_QR);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-4">
      <p className="text-sm text-muted-foreground">
        If LootBazaar.in saves you money, fuel the next sync ☕
      </p>
      <div className="mt-3 flex items-center gap-4">
        <img
          src={src}
          onError={() => setSrc(FALLBACK_QR)}
          alt="UPI donation QR"
          className="size-28 rounded-lg bg-white p-1.5 border border-border object-contain"
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">UPI ID</div>
          <code className="block mt-1 px-2 py-1.5 rounded-md bg-background border border-border text-sm font-mono break-all">
            {UPI_ID}
          </code>
          <button
            onClick={copy}
            className="mt-2 text-xs text-primary hover:underline"
          >
            {copied ? "Copied ✓" : "Copy UPI ID"}
          </button>
        </div>
      </div>
    </div>
  );
}
