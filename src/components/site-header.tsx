import { Link } from "@tanstack/react-router";
import { BrandLogo } from "./brand-logo";
import { SettingsDrawer } from "./settings-drawer";
import { Home, LayoutGrid, BookOpen, Mail } from "lucide-react";

type NavItem = { to: "/" | "/categories" | "/blog" | "/about"; label: string; Icon: typeof Home; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/", label: "Home", Icon: Home, exact: true },
  { to: "/categories", label: "Categories", Icon: LayoutGrid },
  { to: "/blog", label: "Tips & Blog", Icon: BookOpen },
  { to: "/about", label: "About / Contact", Icon: Mail },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 bg-[#131921] text-white border-b border-black/40">
      <div className="mx-auto max-w-7xl px-3 py-2.5 flex items-center gap-4">
        <BrandLogo />
        <nav className="hidden md:flex items-center gap-1 ml-2">
          {NAV.map(({ to, label, Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: !!exact }}
              activeProps={{ className: "bg-[#FEB069] text-black border-[#FEB069]" }}
              inactiveProps={{ className: "text-white border-white/10 hover:bg-white/10 hover:border-[#FEB069]/40" }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        <SettingsDrawer />
        <a
          href="/admin"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#232f3e] text-white text-sm font-medium hover:bg-[#37475a] transition border border-white/10"
        >
          Admin
        </a>
      </div>
      {/* Mobile nav */}
      <nav className="md:hidden bg-[#232f3e] border-t border-black/30">
        <div className="mx-auto max-w-7xl px-2 py-1.5 flex gap-1 overflow-x-auto no-scrollbar">
          {NAV.map(({ to, label, Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: !!exact }}
              activeProps={{ className: "bg-[#FEB069] text-black border-[#FEB069]" }}
              inactiveProps={{ className: "text-white border-white/10 hover:bg-white/10" }}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition whitespace-nowrap"
            >
              <Icon className="size-3.5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
