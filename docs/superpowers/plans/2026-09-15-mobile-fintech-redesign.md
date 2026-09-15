# Rediseño visual fintech-minimalista Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sustituir la identidad visual genérica (indigo/Geist/tarjetas-SaaS) de la app por un lenguaje "fintech minimalista" propio (tokens ink/surface/card/muted/accent + tipografía Fraunces/IBM Plex Sans), con un hero de saldo tipo extracto en el dashboard, un nav inferior de barra fija, y reordenamiento de contenido en dashboard/categorías/gráficos.

**Architecture:** Cambios puramente de presentación (Tailwind classes + 2 componentes nuevos: `BalanceHero`, nav rediseñado). No se toca schema, servicios, actions ni rutas API. Los tokens se definen una vez en `globals.css` (Tailwind v4 `@theme inline`, igual que `--color-background` ya existente) y se consumen como clases Tailwind normales (`bg-ink`, `text-muted`, etc.) en el resto del árbol.

**Tech Stack:** Next.js 16 (App Router) + Tailwind v4 + `next/font/google` (Fraunces, IBM Plex Sans) + Recharts (ya en uso, para el sparkline del hero).

**Spec:** `docs/superpowers/specs/2026-09-15-mobile-fintech-redesign-design.md`

## Global Constraints

- Los colores de categoría (`Category.color` en BD, usados en `CategoryIcon`, badges, gráficos) **no se tocan**.
- `StatusBadge` (ok/warning/overdue) **no cambia de color** — es semántico.
- Los colores de importe (`text-emerald-600`/`text-red-600` para ingreso/gasto, y equivalentes) **no cambian** — son semánticos, no del sistema de marca.
- `chartTheme.ts` (colores de datos de los gráficos: `chartColors.income`, `.expense`, `.gridline`, `.axis`) **no se toca** — es paleta de datos, no de UI.
- Modo oscuro: fuera de alcance (solo tema claro).
- Tras cada tarea: `docker compose build app` debe pasar (incluye `next build` con type-check). No se considera una tarea terminada si el build falla.
- Verificación visual: usar Claude in Chrome con el truco de `iframe` de 390px (ya usado en esta sesión — ver mensajes previos) contra `http://localhost:8095` tras `docker compose up -d --no-deps app`.

### Tabla de sustitución (usada literalmente por las Tareas 7-11)

Estas tareas son un barrido mecánico de clases Tailwind, no lógica nueva — se aplican como *find & replace* dentro de cada archivo listado, **solo** sobre las clases de esta tabla. Cualquier otra clase de color (iconos de categoría, `StatusBadge`, verde/rojo de importe) se deja intacta.

| Antigua | Nueva |
|---|---|
| `bg-white` (fondo de tarjeta/panel) | `bg-card` |
| `border-gray-200` | `border-border` |
| `border-gray-100` / `divide-gray-100` | `border-border` / `divide-border` |
| `border-gray-300` (inputs/dashed) | `border-border` |
| `text-gray-900` / `text-gray-800` / `text-gray-700` | `text-ink` |
| `text-gray-500` / `text-gray-400` | `text-muted` |
| `text-indigo-600` / `text-indigo-800` (enlaces) | `text-accent` |
| `hover:text-indigo-600` / `hover:text-indigo-800` | `hover:text-accent` |
| `bg-indigo-600` (botón/pill primario) | `bg-ink` |
| `hover:bg-indigo-700` / `hover:bg-indigo-500` (sobre `bg-ink`) | `hover:opacity-90` |
| `focus:border-indigo-500` | `focus:border-accent` |
| `focus:ring-indigo-500` / `ring-indigo-500` | `focus:ring-accent` / `ring-accent` |
| `rounded-2xl` / `rounded-3xl` (tarjetas/paneles, NO botones/avatares pequeños) | `rounded-lg` |
| `shadow-sm` en tarjetas con `border` (queda redundante) | (eliminar, se apoya solo en `border-border`) |

No sustituir dentro de: SVGs de coche/casa (`CarSvg.tsx`, `HouseSvg.tsx`), `chartTheme.ts`, colores de categoría, `StatusBadge`, `KIND_DOT`/`KIND_TEXT_COLOR` de `AppCalendar.tsx` (semánticos: gasto/ingreso/mantenimiento).

---

## Task 1: Tokens de color y tipografía

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: clases Tailwind `bg-ink`, `text-ink`, `border-ink`, `bg-surface`, `bg-card`, `text-muted`, `bg-accent`, `text-accent`, `border-accent`, `ring-accent`, `border-border`, `divide-border`, y `font-display` (Fraunces) / `font-sans` (IBM Plex Sans, ya es la fuente por defecto del body). Todas las tareas siguientes consumen estas clases.

- [ ] **Step 1: Actualizar `globals.css`**

Reemplazar el contenido de `src/app/globals.css` por:

```css
@import "tailwindcss";

:root {
  --background: #f4f6f8;
  --foreground: #12151c;
  --color-ink: #12151c;
  --color-surface: #f4f6f8;
  --color-card: #ffffff;
  --color-muted: #667085;
  --color-accent: #2454ff;
  --color-border: #e4e7ec;
  color-scheme: light;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-ink: var(--color-ink);
  --color-surface: var(--color-surface);
  --color-card: var(--color-card);
  --color-muted: var(--color-muted);
  --color-accent: var(--color-accent);
  --color-border: var(--color-border);
  --font-sans: var(--font-plex);
  --font-display: var(--font-fraunces);
  --font-mono: var(--font-plex);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-plex), Arial, Helvetica, sans-serif;
}

.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.recharts-wrapper:focus,
.recharts-wrapper *:focus,
.recharts-surface:focus {
  outline: none;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}

@keyframes telltale-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.62; }
}

.telltale-pulse {
  animation: telltale-pulse 1.8s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .telltale-pulse {
    animation: none;
  }
}

input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
```

(Único cambio funcional además de los tokens: el thumb del scrollbar pasa de `#cbd5e0` a `var(--color-border)`.)

- [ ] **Step 2: Sustituir Geist por Fraunces + IBM Plex Sans en `layout.tsx`**

Reemplazar el contenido de `src/app/layout.tsx` por:

```tsx
import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import { NavBar } from "@/components/ui/NavBar";
import { runDueRecurringRules } from "@/lib/core/recurringService";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-fraunces",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
});

export const metadata: Metadata = {
  title: "Mis Gastos",
  description: "Gestión de gastos personales",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await runDueRecurringRules();

  return (
    <html lang="es" className={`${fraunces.variable} ${plexSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-surface">
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-4 pb-24 sm:px-6 sm:py-6">{children}</main>
        <NavBar />
      </body>
    </html>
  );
}
```

Cambios respecto al original: fuentes (`Fraunces`/`IBM_Plex_Sans` en vez de `Geist`/`Geist_Mono`), `bg-[#f7fafc]` inline → `bg-surface`, `pb-28` → `pb-24` (la nueva `NavBar` de la Tarea 3 es una barra fija más baja que la píldora flotante actual, no necesita tanto hueco).

- [ ] **Step 3: Verificar el build**

```bash
docker compose build app
```

Expected: build exitoso (esto NO verifica visualmente nada todavía, solo que compila — el resto de la app sigue usando clases `indigo-`/`gray-` sin romperse porque Tailwind las sigue generando igual, no dependen de los tokens nuevos).

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "Sustituye Geist por Fraunces/IBM Plex Sans y define tokens de color fintech"
```

---

## Task 2: Componentes UI compartidos

**Files:**
- Modify: `src/components/ui/Button.tsx`
- Modify: `src/components/ui/Input.tsx`
- Modify: `src/components/ui/Select.tsx`
- Modify: `src/components/ui/Modal.tsx`
- Modify: `src/components/ui/Badge.tsx`
- Modify: `src/components/ui/PageHeading.tsx`
- Modify: `src/components/ui/EmptyState.tsx`
- Modify: `src/components/ui/Skeleton.tsx`
- Modify: `src/components/ui/DatePicker.tsx`

**Interfaces:** Ninguna prop cambia — solo clases internas. Todas las páginas que ya usan estos componentes heredan el nuevo look sin más cambios.

**Depends on:** Task 1 (necesita los tokens ya definidos).

- [ ] **Step 1: `Button.tsx`**

```tsx
import { type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-ink text-white hover:opacity-90",
  secondary: "border border-ink bg-transparent text-ink hover:bg-ink/5",
  danger: "bg-red-600 text-white hover:bg-red-500",
  ghost: "bg-transparent text-muted hover:bg-black/5",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 2: `Input.tsx`**

Cambiar la clase del `<input>` a:

```tsx
"w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
```

(se elimina `shadow-sm`; el resto del archivo no cambia).

- [ ] **Step 3: `Select.tsx`**

Cambiar la clase del `<select>` a:

```tsx
"w-full appearance-none rounded-lg border border-border bg-card px-3 py-2 pr-9 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
```

y la clase del `ChevronDown` de `text-gray-400` a `text-muted`.

- [ ] **Step 4: `Modal.tsx`**

- Panel: `rounded-2xl bg-white shadow-xl` → `rounded-lg bg-card shadow-xl` (el modal SÍ conserva sombra — es una superficie flotante sobre el contenido, no una tarjeta en el flujo normal).
- Título: `text-base font-semibold text-gray-900` → `font-display text-base font-semibold text-ink`.
- Botón cerrar: `text-gray-400 hover:bg-gray-100 hover:text-gray-600` → `text-muted hover:bg-black/5 hover:text-ink`.

- [ ] **Step 5: `Badge.tsx`**

En `Badge` (el genérico, no `StatusBadge` — ese no cambia): `bg-gray-100 text-gray-700` → `bg-surface text-ink`.

- [ ] **Step 6: `PageHeading.tsx`**

```tsx
export function PageHeading({ title, subtitle }: { title: React.ReactNode; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-[30px] w-[30px] shrink-0 rounded-[9px] bg-ink" />
      <div>
        <h1 className="m-0 font-display text-xl font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
```

(el cuadrado con gradiente `#667eea→#764ba2` pasa a ser un bloque sólido `bg-ink` — era el resto más visible de la paleta indigo/violeta genérica).

- [ ] **Step 7: `EmptyState.tsx`**

```tsx
export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
    </div>
  );
}
```

- [ ] **Step 8: `Skeleton.tsx`**

Cambiar `bg-gray-100` → `bg-border` en `Skeleton`, y `rounded-2xl` → `rounded-lg` en `CardSkeleton`.

- [ ] **Step 9: `DatePicker.tsx`**

Sustituir en el botón principal: `border-gray-200`→`border-border`, `text-gray-900`→`text-ink`, `text-gray-400`→`text-muted` (icono calendario y placeholder), `focus:border-indigo-500 focus:ring-indigo-500`→`focus:border-accent focus:ring-accent`.

En el popover: `border-gray-200`→`border-border`; botones de mes (`border-gray-200 text-gray-500`)→(`border-border text-muted`); días: `text-gray-700`→`text-ink`, `text-gray-300`→`text-muted/60`, seleccionado `bg-indigo-600`→`bg-ink`, hoy `text-indigo-600`→`text-accent`.

- [ ] **Step 10: Verificar build**

```bash
docker compose build app
```

- [ ] **Step 11: Commit**

```bash
git add src/components/ui/
git commit -m "Aplica los tokens fintech a los componentes UI compartidos"
```

---

## Task 3: Nav inferior — barra fija de borde a borde

**Files:**
- Modify: `src/components/ui/NavBar.tsx`

**Depends on:** Task 1.

- [ ] **Step 1: Reescribir `NavBar.tsx`**

```tsx
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
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            title={l.label}
            className={`relative flex flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[9.5px] font-semibold transition-colors sm:flex-none sm:px-4 sm:text-[10.5px] ${
              active ? "text-accent" : "text-muted hover:text-ink"
            }`}
          >
            {active && <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-accent" />}
            <Icon size={18} />
            <span className="whitespace-nowrap">{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Verificar build**

```bash
docker compose build app
```

- [ ] **Step 3: Verificación visual (390px y 360px)**

`docker compose up -d --no-deps app`, abrir con el truco de iframe de Claude in Chrome, confirmar: barra pegada al borde inferior sin hueco ni sombra flotante, las 6 etiquetas visibles sin scroll horizontal, el item activo en azul `accent` con la rayita superior, sin overlap con el contenido de la página (gracias al `pb-24` de la Tarea 1).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/NavBar.tsx
git commit -m "Rediseña el nav inferior como barra fija de borde a borde"
```

---

## Task 4: Dashboard — hero de saldo y reordenamiento

**Files:**
- Create: `src/components/dashboard/BalanceHero.tsx`
- Delete: `src/components/dashboard/BalanceCard.tsx`
- Delete: `src/components/dashboard/SummaryCards.tsx`
- Modify: `src/components/dashboard/CategoryComparisonList.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `BalanceHero({ balance, income, expense, trend }) => JSX.Element` — `balance: { amount: number; asOfDate: Date } | null`, `income: number`, `expense: number`, `trend: { month: string; balance: number }[]` (mismo shape que `monthlyBalanceData` ya construido en `page.tsx`).

**Depends on:** Tasks 1-3 (usa `Input`, `DatePicker`, tokens, y se coloca justo debajo del nuevo nav/layout).

- [ ] **Step 1: Crear `BalanceHero.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { setBalanceAnchorAction } from "@/lib/actions/balance";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { formatDate, formatEUR } from "@/lib/format";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export interface BalanceHeroProps {
  balance: { amount: number; asOfDate: Date } | null;
  income: number;
  expense: number;
  trend: { month: string; balance: number }[];
}

export function BalanceHero({ balance, income, expense, trend }: BalanceHeroProps) {
  const [current, setCurrent] = useState(balance);
  const [editing, setEditing] = useState(!balance);
  const [amount, setAmount] = useState(balance?.amount ?? 0);
  const [date, setDate] = useState(balance ? balance.asOfDate.toISOString().slice(0, 10) : todayInputValue());
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setCurrent(balance);
  }, [balance]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("amount", String(amount));
      formData.set("asOfDate", date);
      await setBalanceAnchorAction(formData);
      setCurrent({ amount, asOfDate: new Date(date) });
      setEditing(false);
    } finally {
      setPending(false);
    }
  }

  const net = income - expense;
  const previous = trend.length > 1 ? trend[trend.length - 2].balance : null;
  const delta = current && previous !== null ? current.amount - previous : null;

  return (
    <div className="-mx-4 -mt-4 bg-ink px-4 pb-6 pt-5 text-white sm:-mx-6 sm:-mt-6 sm:rounded-b-lg sm:px-8 sm:pt-6">
      <div className="flex items-center justify-between text-xs font-medium text-white/60">
        <span>Resumen · {formatDate(new Date())}</span>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="rounded-md px-2 py-1 font-semibold text-white/80 hover:bg-white/10 hover:text-white"
          >
            Editar saldo
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-end gap-2.5">
          <div className="w-full sm:w-32">
            <label className="mb-1 block text-[11px] text-white/60">Importe</label>
            <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>
          <div className="w-full sm:w-36">
            <label className="mb-1 block text-[11px] text-white/60">A fecha de</label>
            <DatePicker value={date} onChange={setDate} />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-lg bg-accent px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "..." : "Guardar"}
          </button>
          {current && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="h-10 rounded-lg bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/20"
            >
              Cancelar
            </button>
          )}
        </form>
      ) : (
        <>
          <p className="mt-2 font-display text-4xl font-semibold tabular-nums tracking-tight">{formatEUR(current!.amount)}</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-xs text-white/60">a {formatDate(current!.asOfDate)}</span>
            {delta !== null && (
              <span className={`text-xs font-semibold ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {delta >= 0 ? "+" : ""}
                {formatEUR(delta)} este mes
              </span>
            )}
          </div>

          {trend.length > 1 && (
            <div className="mt-3 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
                  <defs>
                    <linearGradient id="heroTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5b8cff" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#5b8cff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="balance" stroke="#5b8cff" strokeWidth={2} fill="url(#heroTrend)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
            <div>
              <p className="text-[11px] font-medium text-white/60">Ingresos</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-emerald-400">{formatEUR(income)}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-white/60">Gastos</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-red-400">{formatEUR(expense)}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-white/60">Ahorro</p>
              <p className={`mt-0.5 text-sm font-semibold tabular-nums ${net >= 0 ? "text-white" : "text-red-400"}`}>
                {formatEUR(net)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Borrar `BalanceCard.tsx` y `SummaryCards.tsx`**

```bash
git rm src/components/dashboard/BalanceCard.tsx src/components/dashboard/SummaryCards.tsx
```

- [ ] **Step 3: Actualizar tokens en `CategoryComparisonList.tsx`**

Sustituir (todas las apariciones): `text-gray-700`→`text-ink`, `text-gray-900`→`text-ink`, `text-gray-400`→`text-muted`, `border-gray-100`→`border-border`, `hover:bg-gray-50`→`hover:bg-surface`. No tocar los colores inline (`style={{ background: r.color }}`, delta rojo/verde) — son datos de categoría/semánticos.

- [ ] **Step 4: Reescribir el `return` de `src/app/page.tsx`**

Eliminar el import de `PageHeading` (ya no se usa en esta página) y añadir `import { BalanceHero } from "@/components/dashboard/BalanceHero";` (quitar los imports de `BalanceCard` y `SummaryCards`). Sustituir el `return (...)` completo por:

```tsx
  return (
    <div className="space-y-6">
      <BalanceHero balance={balance} income={income} expense={expense} trend={monthlyBalanceData} />

      {attentionNeeded.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted">Necesitan atención</h2>
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {attentionNeeded.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 px-4 py-2 text-sm">
                <Link href={`/items/${c.item.slug}`} className="min-w-0 truncate text-ink hover:text-accent">
                  {c.label} · {c.item.name}
                </Link>
                <StatusBadge status={c.status} className="shrink-0" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {isFiltered ? (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-display text-base font-semibold text-ink">
              {MONTH_LABEL.format(reference).replace(/^./, (c) => c.toUpperCase())}
            </span>
            <Link href={`/gastos?month=${month}`} className="inline-block py-2 text-accent hover:opacity-80">
              Ver transacciones →
            </Link>
            <Link href="/" className="inline-block py-2 text-muted hover:text-ink">
              Quitar filtro ✕
            </Link>
          </div>
        ) : (
          <span />
        )}
        <TransactionModal categories={categories} trigger="Nueva transacción" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium text-muted">Ingresos vs gastos (6 meses)</h2>
          <IncomeVsExpenseChart data={monthlySummary} />
        </section>
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium text-muted">Balance acumulado (6 meses)</h2>
          <BalanceTrendChart data={monthlySummary} />
        </section>
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium text-muted">Ahorro por mes (6 meses)</h2>
        <SavingsChart data={monthlySummary} />
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium text-muted">Saldo por mes</h2>
        <MonthlyBalanceChart data={monthlyBalanceData} />
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-4 text-sm font-medium text-muted">Gasto por categoría vs mes anterior</h2>
        <CategoryComparisonList rows={categoryComparison} />
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium text-muted">Productos más comprados (comida)</h2>
        <TopProductsChart data={topProducts} />
      </section>
    </div>
  );
```

El resto de la función (cálculo de `income`, `expense`, `attentionNeeded`, etc.) no cambia.

- [ ] **Step 5: Verificar build**

```bash
docker compose build app
```

- [ ] **Step 6: Verificación visual (390px)**

Redesplegar (`docker compose up -d --no-deps app`) y comprobar: franja oscura a todo lo ancho con saldo grande en Fraunces + sparkline + fila de 3 datos, "Necesitan atención" justo debajo, botón "Nueva transacción" visible, gráficos debajo sin romper. Probar también el flujo de editar saldo (botón "Editar saldo" dentro del hero).

- [ ] **Step 7: Commit**

```bash
git add -A -- src/components/dashboard/ src/app/page.tsx
git commit -m "Rediseña el dashboard: hero de saldo tipo extracto y reordenamiento"
```

---

## Task 5: Categorías — reordenamiento + tokens

**Files:**
- Modify: `src/app/categorias/page.tsx`
- Modify: `src/components/categories/CategoryList.tsx`
- Modify: `src/components/categories/CategoryForm.tsx`
- Modify: `src/components/categories/CategoryStats.tsx`
- Modify: `src/app/categorias/[categorySlug]/page.tsx`

**Depends on:** Tasks 1-2. Independiente de las Tareas 4, 6-11 (puede ejecutarse en paralelo con ellas).

- [ ] **Step 1: Reordenar `src/app/categorias/page.tsx`**

Mover el bloque que renderiza `<CategoryList ... />` para que aparezca **antes** que `<CategoryStats ... />` en el JSX (hoy están al revés, o en el orden que corresponda según el archivo actual — confirmar leyendo el archivo antes de tocarlo, ya que no se ha citado su contenido completo en esta sesión). El resto de la página (cabecera, botón "Nueva categoría", toggle de edición) no cambia de posición.

- [ ] **Step 2: Aplicar la tabla de sustitución global** (ver Global Constraints) a `CategoryList.tsx`, `CategoryForm.tsx`, `CategoryStats.tsx` y ambas páginas (`categorias/page.tsx`, `categorias/[categorySlug]/page.tsx`).

No tocar: los `COLOR_OPTIONS` de `CategoryForm.tsx` (son las opciones de color para categorías nuevas, no tokens de UI), ni el color/icono de cada `Category` renderizado en `CategoryList.tsx`.

- [ ] **Step 3: Verificar build**

```bash
docker compose build app
```

- [ ] **Step 4: Verificación visual (390px)**: grid de categorías arriba, estadísticas debajo, modal "Nueva categoría" con el nuevo look.

- [ ] **Step 5: Commit**

```bash
git add src/app/categorias/ src/components/categories/
git commit -m "Aplica tokens fintech y reordena la pantalla de categorías"
```

---

## Task 6: Gráficos — reordenamiento + tokens

**Files:**
- Modify: `src/app/graficos/page.tsx`
- Modify: `src/components/charts/ChartTooltip.tsx`

**Depends on:** Tasks 1-2. Paralelizable con Tasks 4, 5, 7-11.

- [ ] **Step 1: Reordenar secciones en `src/app/graficos/page.tsx`**

Orden final de las 4 secciones (de arriba a abajo, ya no en 2 filas de 2 columnas sino en el orden de prioridad): Gasto por categoría → Top comercios → Gasto por día de la semana → Gasto por elemento. Mantener el layout `grid grid-cols-1 gap-6 lg:grid-cols-2` en pares consecutivos (categoría+comercios en la primera fila como ya está hoy; día-de-semana+por-elemento en la segunda fila, mismo orden que ya tienen entre sí — el único cambio real es que si "por elemento" estuviera antes que "día de la semana" en el archivo actual, se invierten).

- [ ] **Step 2: Aplicar la tabla de sustitución global** a los wrappers de sección (`rounded-2xl border border-gray-200 bg-white p-4` → `rounded-lg border border-border bg-card p-4`) y a los botones de rango (`bg-indigo-600 text-white` → `bg-ink text-white`; `text-gray-500 hover:bg-gray-50` → `text-muted hover:bg-surface`) en `graficos/page.tsx`.

- [ ] **Step 3: `ChartTooltip.tsx`**: `border-black/10 bg-white` → `border-border bg-card`; `text-gray-900`→`text-ink`; `text-gray-600`→`text-muted`. No tocar los colores de `entry.color` (vienen de `chartTheme.ts`/categoría).

- [ ] **Step 4: Verificar build**

```bash
docker compose build app
```

- [ ] **Step 5: Verificación visual (390px)**: orden de secciones, tooltip de un gráfico con el nuevo estilo.

- [ ] **Step 6: Commit**

```bash
git add src/app/graficos/ src/components/charts/ChartTooltip.tsx
git commit -m "Aplica tokens fintech y reordena la pantalla de gráficos"
```

---

## Task 7: Transacciones — tokens (sin reordenar)

**Files:**
- Modify: `src/app/gastos/page.tsx`
- Modify: `src/app/comercios/[notes]/page.tsx`
- Modify: `src/components/transactions/TransactionTable.tsx`
- Modify: `src/components/transactions/TransactionForm.tsx`
- Modify: `src/components/transactions/TransactionModal.tsx`
- Modify: `src/components/transactions/RecurringRuleList.tsx`
- Modify: `src/components/transactions/TransactionLinesEditor.tsx`
- Modify: `src/components/transactions/DeleteTransactionButton.tsx`

**Depends on:** Tasks 1-2. Paralelizable con Tasks 4-6, 8-11 (no comparte archivos con ninguna).

- [ ] **Step 1:** Aplicar la tabla de sustitución global (ver Global Constraints) a cada archivo listado. No tocar `text-emerald-600`/`text-red-600` (semántico ingreso/gasto) ni los colores de `CategoryIcon`.

- [ ] **Step 2: Verificar build**

```bash
docker compose build app
```

- [ ] **Step 3: Verificación visual (390px)**: lista de gastos, modal de nueva transacción, ficha de comercio.

- [ ] **Step 4: Commit**

```bash
git add src/app/gastos/ src/app/comercios/ src/components/transactions/
git commit -m "Aplica tokens fintech al dominio de transacciones"
```

---

## Task 8: Calendario — tokens (sin reordenar)

**Files:**
- Modify: `src/app/calendario/page.tsx`
- Modify: `src/components/calendar/AppCalendar.tsx`

**Depends on:** Tasks 1-2. Paralelizable con Tasks 4-7, 9-11.

- [ ] **Step 1:** Aplicar la tabla de sustitución global. No tocar `KIND_DOT`/`KIND_TEXT_COLOR` (colores semánticos gasto/ingreso/mantenimiento) ni la escala de `heatBg()` (heatmap de gasto diario).

- [ ] **Step 2: Verificar build**

```bash
docker compose build app
```

- [ ] **Step 3: Verificación visual (390px)**: grid del mes, panel de movimientos del día seleccionado.

- [ ] **Step 4: Commit**

```bash
git add src/app/calendario/ src/components/calendar/
git commit -m "Aplica tokens fintech al calendario"
```

---

## Task 9: Items y mantenimiento — tokens (sin reordenar)

**Files:**
- Modify: `src/app/items/page.tsx` (si existe contenido propio) y `src/app/items/[itemSlug]/page.tsx`
- Modify: `src/components/items/ItemExpensesPanel.tsx`
- Modify: `src/components/items/DeleteItemButton.tsx`
- Modify: `src/components/items/ItemList.tsx`
- Modify: `src/components/items/visual-card/VisualCard.tsx` (solo el "chrome" alrededor del dibujo — cabecera, badges de estado, grid de componentes debajo; **no** los colores del SVG del coche/casa en sí)
- Modify: `src/components/maintenance/MaintenanceComponentsList.tsx`
- Modify: `src/components/maintenance/MaintenanceComponentForm.tsx`
- Modify: `src/components/maintenance/MaintenanceComponentEditForm.tsx`
- Modify: `src/components/maintenance/MaintenanceHistoryTable.tsx`

**Depends on:** Tasks 1-2. Paralelizable con Tasks 4-8, 10-11.

- [ ] **Step 1:** Aplicar la tabla de sustitución global a todos los archivos listados. No tocar `CarSvg.tsx`/`HouseSvg.tsx` (fuera de esta tarea por completo — no están en la lista de archivos), ni `ZONE_STATUS_BADGE_BG`/`ZONE_STATUS_BADGE_TEXT`/`ZONE_STATUS_LABEL` de `zoneStatusColors.ts` (semántico, igual que `StatusBadge`).

- [ ] **Step 2: Verificar build**

```bash
docker compose build app
```

- [ ] **Step 3: Verificación visual (390px)**: ficha de coche/casa (el dibujo interactivo debe verse exactamente igual que antes, solo cambia el marco/tarjetas alrededor), lista de componentes de mantenimiento.

- [ ] **Step 4: Commit**

```bash
git add src/app/items/ src/components/items/ src/components/maintenance/
git commit -m "Aplica tokens fintech a items y mantenimiento"
```

---

## Task 10: Importar — tokens (sin reordenar)

**Files:**
- Modify: `src/app/importar/page.tsx`
- Modify: `src/components/import/ImportCsvClient.tsx`

**Depends on:** Tasks 1-2. Paralelizable con Tasks 4-9, 11.

- [ ] **Step 1:** Aplicar la tabla de sustitución global. No tocar los colores de estado de fila (`opacity-40` para ya importadas) ni ningún color de categoría mostrado en los `<Select>` de la tabla.

- [ ] **Step 2: Verificar build**

```bash
docker compose build app
```

- [ ] **Step 3: Verificación visual (390px)**: dropzone, tabs, tabla de previsualización con el nuevo estilo (scroll horizontal ya arreglado en la pasada anterior, no debe regresar).

- [ ] **Step 4: Commit**

```bash
git add src/app/importar/ src/components/import/
git commit -m "Aplica tokens fintech a la pantalla de importación"
```

---

## Task 11: Viajes — tokens (sin reordenar)

**Files:**
- Modify: `src/components/trips/TravelMap.tsx`
- Modify: `src/components/trips/TripForm.tsx`
- Modify: `src/components/trips/TripStats.tsx`

**Depends on:** Tasks 1-2. Paralelizable con Tasks 4-10.

- [ ] **Step 1:** Aplicar la tabla de sustitución global a los 3 archivos. No tocar `VISITED_COLOR`/`SUBDIVISION_VISITED_COLOR`/`BASE_COLOR`/`HOVER_COLOR` del mapa (son datos del mapa, no UI chrome).

- [ ] **Step 2: Verificar build**

```bash
docker compose build app
```

- [ ] **Step 3: Verificación visual (390px)**: tarjeta de viajes dentro de `categorias/viajes`, mapa, formulario de nuevo viaje.

- [ ] **Step 4: Commit**

```bash
git add src/components/trips/
git commit -m "Aplica tokens fintech al dominio de viajes"
```

---

## Cierre

- [ ] **Verificación final:** con todas las tareas mergeadas, `docker compose build app` + `docker compose up -d --no-deps app`, recorrer con Claude in Chrome a 390px: dashboard, gastos, categorías, gráficos, calendario, ficha de item, importar, comercios — confirmar que no queda ninguna clase `indigo-`/`gray-` de la paleta antigua fuera de las excepciones documentadas (colores de categoría, `StatusBadge`, verde/rojo semántico, SVGs, `chartTheme.ts`).
- [ ] `npm run lint` dentro del contenedor — se espera que sigan solo los 3 errores preexistentes (`react-hooks/set-state-in-effect` en `DatePicker.tsx`/`Modal.tsx`, más el nuevo en `BalanceHero.tsx` si reproduce el mismo patrón que `BalanceCard.tsx` tenía — no es objetivo de este plan arreglarlo, ya estaba así).
