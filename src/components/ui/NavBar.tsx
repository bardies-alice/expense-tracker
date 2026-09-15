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
    <nav className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100vw-1.5rem)] -translate-x-1/2 justify-between gap-0.5 rounded-[22px] bg-slate-900/95 p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.28)] backdrop-blur-md sm:w-auto sm:justify-start sm:gap-1">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            title={l.label}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1.5 py-2 text-[10.5px] font-semibold transition-colors sm:min-w-[60px] sm:flex-none sm:px-2.5 ${
              active ? "bg-indigo-600 text-white" : "text-white/55 hover:text-white/80"
            }`}
          >
            <Icon size={17} />
            <span className={`whitespace-nowrap ${active ? "" : "hidden sm:inline"}`}>{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
