"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, Tags, BarChart3, Calendar, Upload } from "lucide-react";

const LINKS = [
  { href: "/", label: "Resumen", icon: LayoutDashboard },
  { href: "/gastos", label: "Gastos", icon: Wallet },
  { href: "/categorias", label: "Categorías", icon: Tags },
  { href: "/graficos", label: "Gráficos", icon: BarChart3 },
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/importar", label: "Importar", icon: Upload },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex justify-between border-t border-border bg-card"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            title={l.label}
            className={`relative flex flex-1 flex-col items-center gap-1.5 px-1 py-3.5 text-[9.5px] font-semibold transition-colors sm:flex-none sm:px-4 sm:text-[10.5px] ${
              active ? "text-accent" : "text-muted hover:text-ink"
            }`}
          >
            {active && <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-accent" />}
            <Icon size={24} />
            <span className="whitespace-nowrap">{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
