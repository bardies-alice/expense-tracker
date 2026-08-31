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
    <nav className="no-scrollbar fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 gap-1 overflow-x-auto rounded-[22px] bg-slate-900/95 p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.28)] backdrop-blur-md">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            title={l.label}
            className={`flex min-w-[60px] shrink-0 flex-col items-center gap-0.5 rounded-2xl px-2.5 py-2 text-[10.5px] font-semibold transition-colors ${
              active ? "bg-indigo-600 text-white" : "text-white/55 hover:text-white/80"
            }`}
          >
            <Icon size={17} />
            <span className="whitespace-nowrap">{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
