import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Settings, Moon, Sun, Trash2, Heart, ShieldCheck } from "lucide-react";
import { useSettings } from "@/lib/settings";
import { DonationCard } from "./donation-card";

export function SettingsDrawer() {
  const { theme, setTheme, currency, setCurrency, clearCache } = useSettings();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          aria-label="Open settings"
          className="inline-flex items-center justify-center size-9 rounded-lg bg-[#232f3e] text-white border border-white/10 hover:bg-[#37475a] hover:border-[#FEB069]/40 transition"
        >
          <Settings className="size-4" />
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-background/95 backdrop-blur">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Tune your loot experience.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-4 pb-8">
          <section>
            <h3 className="text-sm font-semibold mb-2">Theme</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                className="justify-start"
              >
                <Moon className="size-4" /> Dark
              </Button>
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                className="justify-start"
              >
                <Sun className="size-4" /> Light
              </Button>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-2">Region & currency</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={currency === "INR" ? "default" : "outline"}
                onClick={() => setCurrency("INR")}
              >
                ₹ INR
              </Button>
              <Button
                variant={currency === "USD" ? "default" : "outline"}
                onClick={() => setCurrency("USD")}
              >
                $ USD
              </Button>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-2">Cache</h3>
            <Button variant="outline" onClick={clearCache} className="w-full justify-start">
              <Trash2 className="size-4" /> Clear Cache & Refresh
            </Button>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-2 inline-flex items-center gap-1.5">
              <Heart className="size-4 text-primary" /> Support the creator
            </h3>
            <DonationCard />
          </section>

          <section className="rounded-xl border border-border bg-card/60 p-4">
            <h3 className="text-sm font-semibold mb-2 inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary" /> Affiliate Disclosure
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              LootBazaar.in is a participant in the Amazon Services LLC Associates Program, an
              affiliate advertising program designed to provide a means for sites to earn
              advertising fees by advertising and linking to Amazon.in. We may earn a commission on
              qualifying purchases made through outbound links — at no extra cost to you.
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
