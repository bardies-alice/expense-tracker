import Link from "next/link";

const LINKS = [
  { href: "/", label: "Resumen" },
  { href: "/categorias", label: "Categorías" },
  { href: "/gastos", label: "Gastos" },
  { href: "/calendario", label: "Calendario" },
];

export function NavBar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
        <span className="text-sm font-semibold text-gray-900">Mis Gastos</span>
        <div className="flex gap-4">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-gray-600 hover:text-indigo-600">
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
