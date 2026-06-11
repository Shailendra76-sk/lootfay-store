import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { syncAmazonProducts, syncCategory } from "@/lib/sync-products.functions";
import { CATEGORIES, Category } from "@/lib/sync-products.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, ArrowLeft, CheckCircle2, AlertTriangle, Lock, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · LootBazaar" },
      {
        name: "description",
        content:
          "Operator console for LootBazaar — manually trigger Amazon India deal syncs and rotate per-category product feeds.",
      },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:url", content: "https://loot-shop-india.lovable.app/admin" },
    ],
    links: [
      { rel: "canonical", href: "https://loot-shop-india.lovable.app/admin" },
    ],
  }),
  component: AdminPage,
});

const SECRET_KEY = "lootbazaar_admin_secret";

function AdminPage() {
  const [secret, setSecret] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(SECRET_KEY);
    if (stored) setSecret(stored);
  }, []);

  if (!secret) {
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center px-4">
        <form
          className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) {
              setAuthError("Enter admin secret");
              return;
            }
            sessionStorage.setItem(SECRET_KEY, input.trim());
            setSecret(input.trim());
            setAuthError(null);
          }}
        >
          <div className="flex items-center gap-2">
            <Lock className="size-5" />
            <h1 className="text-xl font-semibold">Admin access</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter the admin secret to manage product syncs.
          </p>
          <Input
            type="password"
            placeholder="Admin secret"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          {authError && (
            <p className="text-sm text-destructive">{authError}</p>
          )}
          <Button type="submit" className="w-full">Unlock</Button>
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">
            ← Back to storefront
          </Link>
        </form>
      </div>
    );
  }

  return <AdminConsole secret={secret} onLogout={() => { sessionStorage.removeItem(SECRET_KEY); setSecret(null); }} />;
}

function AdminConsole({ secret, onLogout }: { secret: string; onLogout: () => void }) {
  const sync = useServerFn(syncAmazonProducts);
  const syncCat = useServerFn(syncCategory);
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<
    | { kind: "ok"; message: string }
    | { kind: "err"; message: string }
    | null
  >(null);

  const handleAuthError = (msg: string) => {
    if (msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("invalid admin")) {
      sessionStorage.removeItem(SECRET_KEY);
      onLogout();
    }
  };

  const onFullSync = async () => {
    setBusy("full");
    setResult(null);
    try {
      const r = await sync({ data: { secret } });
      setResult({
        kind: "ok",
        message: `Full sync: imported ${r.count} products (of ${r.fetched} fetched).`,
      });
    } catch (e: any) {
      const msg = e?.message ?? "Unknown error";
      setResult({ kind: "err", message: msg });
      handleAuthError(msg);
    } finally {
      setBusy(null);
    }
  };

  const onCategorySync = async (cat: Category) => {
    setBusy(cat);
    setResult(null);
    try {
      const r = await syncCat({ data: { category: cat, secret } });
      setResult({
        kind: "ok",
        message: `${cat}: inserted ${r.inserted}, removed ${r.removed} (fetched ${r.fetched}).`,
      });
    } catch (e: any) {
      const msg = e?.message ?? "Unknown error";
      setResult({ kind: "err", message: msg });
      handleAuthError(msg);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-3">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Storefront
          </Link>
          <span className="ml-auto text-xs text-muted-foreground">Admin</span>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="size-4 mr-1" /> Lock
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Deals control panel</h1>
          <p className="mt-2 text-muted-foreground">
            Each category is auto-synced hourly on a staggered schedule. Manual triggers below.
          </p>
        </div>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <h2 className="font-semibold">Full reset (all categories)</h2>
              <p className="text-sm text-muted-foreground">Wipes the DB and reloads the top deals.</p>
            </div>
            <Button onClick={onFullSync} disabled={busy !== null} className="ml-auto">
              <RefreshCw className={`size-4 mr-2 ${busy === "full" ? "animate-spin" : ""}`} />
              {busy === "full" ? "Syncing…" : "Full Sync"}
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Per-category rotating sync</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Fetches up to 200 fresh products for one category (fanning across 8–10 trending queries), then rotates out the oldest matching count.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                variant="outline"
                onClick={() => onCategorySync(c)}
                disabled={busy !== null}
                className="justify-start"
              >
                <RefreshCw className={`size-4 mr-2 ${busy === c ? "animate-spin" : ""}`} />
                {c}
              </Button>
            ))}
          </div>
        </section>

        {result?.kind === "ok" && (
          <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 p-4 text-sm">
            <CheckCircle2 className="size-4 mt-0.5 text-success" />
            <div>{result.message}</div>
          </div>
        )}
        {result?.kind === "err" && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <AlertTriangle className="size-4 mt-0.5 text-destructive" />
            <div className="break-words">{result.message}</div>
          </div>
        )}

        <section className="text-xs text-muted-foreground space-y-1">
          <p>Cron schedule: Electronics 00:00, Gadgets 01:00, Fashion 02:00, Home &amp; Kitchen 03:00, Books 04:00, Sports 05:00 UTC — repeats every 6 hours.</p>
          <p>Affiliate tag <code>lootbazaar-21</code> is appended to every outbound Amazon link.</p>
        </section>
      </main>
    </div>
  );
}
