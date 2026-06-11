import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "dark" | "light";
export type Currency = "INR" | "USD";

type Settings = {
  theme: Theme;
  currency: Currency;
  setTheme: (t: Theme) => void;
  setCurrency: (c: Currency) => void;
  clearCache: () => void;
};

const Ctx = createContext<Settings | null>(null);

// Prices are stored & shown as raw INR exactly as Amazon.in returns them.
// No conversion / division is applied — the DB value is the source of truth.
export function formatMoney(amount: number | null, _currency?: Currency) {
  if (amount == null) return "—";
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function savingsInr(current: number | null, original: number | null) {
  if (current == null || original == null) return null;
  const diff = Math.round(original - current);
  return diff > 0 ? diff : null;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  // INR is default (Indian audience)
  const [theme, setThemeState] = useState<Theme>("dark");
  const [currency, setCurrencyState] = useState<Currency>("INR");

  useEffect(() => {
    try {
      const t = (localStorage.getItem("lb:theme") as Theme) || "dark";
      const c = (localStorage.getItem("lb:currency") as Currency) || "INR";
      setThemeState(t);
      setCurrencyState(c);
    } catch {}
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("lb:theme", theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("lb:currency", currency);
    } catch {}
  }, [currency]);

  const clearCache = () => {
    try {
      const keep = { theme, currency };
      localStorage.clear();
      localStorage.setItem("lb:theme", keep.theme);
      localStorage.setItem("lb:currency", keep.currency);
      window.location.reload();
    } catch {}
  };

  return (
    <Ctx.Provider
      value={{ theme, currency, setTheme: setThemeState, setCurrency: setCurrencyState, clearCache }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSettings() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSettings must be used inside SettingsProvider");
  return v;
}
