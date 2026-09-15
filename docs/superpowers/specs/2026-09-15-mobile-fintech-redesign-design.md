# Rediseño visual "fintech minimalista" orientado a móvil

Fecha: 2026-09-15
Estado: aprobado por el usuario (ver conversación), pendiente de plan de implementación.

## Contexto y objetivo

La app (Mis Gastos) es funcionalmente completa y ya se hizo una pasada de responsive/mobile-usability en esta misma sesión (ver commits `107f28e`, `312eed5`, `8d063b3`). Ahora se pide un rediseño **visual** que la haga sentir "profesional" y pensada para móvil, no solo "responsive". Actualmente usa la paleta y tipografía por defecto de un scaffold Next.js + Tailwind (indigo-600, gris genérico, Geist) — el objetivo es una identidad visual propia, sin caer en los tics genéricos de una app "hecha con IA" (SaaS-card-kit, cream+serif+terracota, eyebrows en mayúsculas, flechas "→", em-dashes).

Dirección elegida con el usuario: **fintech minimalista** (referencia: Revolut/N26/Mercury), solo modo claro, colores de categoría intactos, tipografía nueva, y permiso para reordenar información dentro de cada pantalla (no solo restyle).

## Alcance

- Todo `src/components/ui/*` (Button, Input, Select, DatePicker, Modal, Badge, PageHeading, NavBar, EmptyState, Skeleton) — el kit de componentes compartido.
- `src/app/layout.tsx`, `globals.css` — fuentes, tokens de color base, fondo de página.
- Dashboard (`src/app/page.tsx` + `src/components/dashboard/*`) — rediseño + reordenamiento (más grande del scope).
- `src/app/categorias/page.tsx` — reordenamiento (grid de categorías primero).
- `src/app/graficos/page.tsx` — reordenamiento (categoría primero).
- Resto de dominios (`gastos`, `calendario`, `importar`, `items`, `categorias/[slug]`, `comercios`) — mismo lenguaje visual (tokens/componentes), sin reordenar.
- Fuera de alcance: lógica de negocio, esquema de datos, rutas API, colores de categoría, modo oscuro.

## Tokens de diseño

### Color

Los colores de categoría (`Category.color`, ya en BD) se mantienen sin tocar — son datos funcionales usados en gráficos/badges/iconos, no tokens de UI.

Nuevos tokens de UI, en `globals.css` como variables CSS (`@theme inline` de Tailwind v4):

| Token | Hex | Uso |
|---|---|---|
| `--color-ink` | `#12151C` | Texto principal, botones primarios, franja "hero" del saldo |
| `--color-surface` | `#F4F6F8` | Fondo de página (sustituye `#f7fafc`) |
| `--color-card` | `#FFFFFF` | Fondo de tarjetas |
| `--color-muted` | `#667085` | Texto secundario (sustituye grises `gray-400/500` sueltos) |
| `--color-accent` | `#2454FF` | Único acento de marca: enlaces, foco, estado activo del nav, icono/CTA secundario |
| `--color-border` | `#E4E7EC` | Borde sutil de tarjetas/inputs (sustituye `border-gray-200`) |

`--color-ink` sustituye `text-gray-900`; `--color-muted` sustituye usos sueltos de `text-gray-400`/`text-gray-500` en textos secundarios (no se tocan los colores semánticos ya establecidos para importes: `emerald-600`/`text-red-600` para ingreso/gasto, ni los colores de `StatusBadge`).

### Tipografía

Sustituye Geist Sans/Mono (`src/app/layout.tsx`) por:

- **Fraunces** (`next/font/google`, variable, pesos 400/600) — títulos de página (`PageHeading`), la cifra grande del saldo, y cabeceras de sección destacadas. Números con `font-variant-numeric: tabular-nums` donde se muestren importes en Fraunces.
- **IBM Plex Sans** (`next/font/google`, pesos 400/500/600) — todo el resto: párrafos, botones, inputs, tablas, nav, badges.

Se mantiene un tercer stack monoespaciado solo si algún componente ya lo necesitaba (no es el caso actualmente — se elimina `Geist_Mono` sin reemplazo).

### Radios y sombras

- Radio de tarjeta: `rounded-lg` (8px) en vez de `rounded-2xl` (16px)/`rounded-3xl` actuales.
- Sombra de tarjeta: se sustituye `shadow-sm`/sin sombra + `border border-gray-200` por **borde de 1px `--color-border`, sin sombra** (look "statement", no "SaaS card").
- La franja "hero" del saldo (única superficie oscura de la app) puede llevar una sombra suave propia para separarse del fondo `surface`.

## Layout

### Dashboard (`src/app/page.tsx`)

Reordenamiento, de arriba a abajo:

1. **Hero de saldo** (nuevo componente `BalanceHero`, sustituye a `BalanceCard` + las 3 `SummaryCards` como bloques separados): franja `--color-ink` a todo el ancho (fuera del `max-w`/padding del layout, o con su propio padding interno amplio). Contiene:
   - Título pequeño "Resumen · {fecha}" en `muted`-sobre-oscuro.
   - Saldo actual en Fraunces, tamaño grande (~36-40px), tabular-nums.
   - Línea de tendencia simple (sparkline, reutilizando datos ya disponibles de `getMonthlyBalances`) + delta del mes ("+1.234 € este mes") en verde/rojo semántico sobre fondo oscuro.
   - Fila compacta de 3 datos (Ingresos / Gastos / Ahorro neto) integrada en el mismo bloque, no como tarjetas separadas.
   - El formulario de edición de saldo (hoy en `BalanceCard`) se conserva, pero como estado alternativo del mismo componente (botón "Editar" abre el formulario dentro de la misma franja).
2. **Necesitan atención** (si hay items) — sube desde el final de la página a justo debajo del hero.
3. **Acción rápida** "+ Nueva transacción" como bloque propio (ya existe como botón en la cabecera; se mantiene ahí, no se duplica).
4. Gráficos (Ingresos vs gastos, Balance acumulado, Ahorro por mes, Gasto por categoría vs mes anterior, Productos más comprados) — sin cambios de orden entre ellos, solo bajan por debajo de "Necesitan atención".

### Categorías (`src/app/categorias/page.tsx`)

La cuadrícula de categorías (`CategoryList`) sube antes que `CategoryStats`. Sin más cambios estructurales.

### Gráficos (`src/app/graficos/page.tsx`)

Orden de secciones: Gasto por categoría → Top comercios → Gasto por día de la semana → Gasto por elemento. (Hoy: categoría y comercios ya van primero en la misma fila; el cambio real es que "por elemento" pasa al final, después de "día de la semana").

### Navegación inferior (`NavBar.tsx`)

Sustituye la píldora flotante oscura (`fixed bottom-4 ... rounded-[22px] bg-slate-900/95`) por una barra fija de borde a borde:
- `fixed bottom-0 inset-x-0`, fondo `--color-card`, borde superior 1px `--color-border`, `padding-bottom: env(safe-area-inset-bottom)`.
- Iconos en `--color-ink` (inactivo: `--color-muted`); el item activo usa `--color-accent` para icono+label y un indicador fino (2px) en la parte superior de ese item.
- Mismo comportamiento responsive ya implementado (todas las etiquetas visibles, sin scroll horizontal) — solo cambia el estilo del contenedor y del estado activo, no el layout flex ya corregido.
- El `<main>` en `layout.tsx` necesita `padding-bottom` suficiente para la nueva barra (ajustar valor si cambia la altura respecto a la píldora actual).

## Componentes compartidos (`src/components/ui/*`)

- **Button**: variante primaria → fondo `ink`, texto blanco, hover ligeramente más claro (`opacity` o mezcla con `card`). Variante secundaria → borde `ink`, texto `ink`, fondo transparente/`card`. Se elimina el uso de `bg-indigo-600` como color de marca por defecto (queda reservado a `accent` para focus/enlaces).
- **Input/Select/DatePicker**: borde `--color-border`; anillo de foco `--color-accent` (sustituye `focus:ring-indigo-500`).
- **Modal**: sin cambios estructurales (ya tiene scroll interno y cabecera fija de la pasada anterior); solo colores de foco/cierre.
- **Badge/StatusBadge**: sin cambios de color (son semánticos: ok/warning/overdue), solo se homogeneiza el fondo `surface`-tintado si aplica.
- **PageHeading**: el icono cuadrado con gradiente `#667eea→#764ba2` se sustituye por un marcador sólido en `--color-ink` o `--color-accent` (decisión de detalle en implementación, ver "Fuera de esta spec"); el título pasa a Fraunces.
- **EmptyState / Skeleton**: mismo patrón, colores actualizados a `muted`/`border`.

## Copy y estados vacíos

Se revisa el texto de estados vacíos y errores existentes contra las pautas de `frontend-design` (voz activa, sin disculpas, decir qué pasó y qué hacer) — no se espera reescritura masiva porque el texto actual ya es en su mayoría directo (p.ej. "Sin transacciones / Registra tu primer gasto o ingreso"), pero se revisa cada uno al tocar su componente.

## Fuera de esta spec (decisiones de detalle en implementación)

- Tratamiento exacto del marcador de `PageHeading` (icono vs. bloque de color).
- Curva/estilo exacto del sparkline del hero (librería ya disponible: Recharts, `AreaChart` minimalista sin ejes).
- Ajuste fino de tamaños de fuente Fraunces por breakpoint.

Estas se resuelven durante la implementación siguiendo los tokens y principios de esta spec, sin necesitar otra ronda de aprobación — son detalle visual, no dirección.

## Testing / verificación

- `docker compose build app` (incluye `next build` con type-check) tras cada tanda de cambios.
- Verificación visual con Claude in Chrome a 390px (iframe trick ya usado en esta sesión, dado que la ventana del entorno no se puede redimensionar) en: dashboard, gastos, categorías, gráficos, calendario, ficha de item, importar.
- `npm run lint` — se acepta que ya había 3 errores preexistentes (`react-hooks/set-state-in-effect` en `BalanceCard`, `DatePicker`, `Modal`) sin relación con este trabajo; no se introducen nuevos.

## Plan de ejecución (dominios paralelizables)

Por la guía de `CLAUDE.md` del repo: los tokens base (`globals.css`, `layout.tsx`, `src/components/ui/*`) son compartidos y se hacen primero, en serie, en el hilo principal (no paralelizable, todo lo demás depende de esto). Una vez esos tokens existen, el resto de dominios (dashboard, categorías, gráficos, resto de pantallas sin reordenar) se reparten en agentes en paralelo por no compartir archivos entre sí.
