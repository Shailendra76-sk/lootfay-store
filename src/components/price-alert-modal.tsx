import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BellRing, CheckCircle2 } from "lucide-react";

export function PriceAlertModal({
  open,
  onOpenChange,
  productTitle,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productTitle: string;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return;
    try {
      const key = "ds:alerts";
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      list.push({ email, productTitle, at: Date.now() });
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}
    setDone(true);
    setTimeout(() => {
      onOpenChange(false);
      setDone(false);
      setEmail("");
    }, 1400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellRing className="size-5 text-primary" />
            Price drop alert
          </DialogTitle>
          <DialogDescription className="line-clamp-2">{productTitle}</DialogDescription>
        </DialogHeader>
        {done ? (
          <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/30 p-4 text-sm">
            <CheckCircle2 className="size-4 text-success" />
            You'll be notified when the price drops.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
            />
            <DialogFooter>
              <Button type="submit" className="w-full">
                Notify me
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
