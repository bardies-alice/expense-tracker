@AGENTS.md

# Mis Gastos — guía de proyecto

**Responde siempre en español**, sin excepción (código/comandos/identificadores quedan en su forma original).

App de gestión de gastos personales. Single-user, sin login. Next.js (App Router) + Prisma + Zod + Tailwind v4 + react-hook-form. UI y rutas en español (`/gastos`, `/categorias`, `/calendario`, `/graficos`, `/items`, `/comercios`, `/importar`).

## Arquitectura (respeta esta capa al añadir/editar lógica)

```
Componente (src/components/**)
  → Server Action (src/lib/actions/*.ts, "use server")
    → valida con Zod (src/lib/validation/schemas.ts)
    → Service (src/lib/core/*Service.ts, lógica de negocio pura)
      → Prisma (prisma/schema.prisma)
```

- Las Server Actions solo parsean `FormData`/args, validan con el schema de Zod y delegan al service; no metas lógica de negocio ahí.
- Los services (`src/lib/core/`) son la única fuente de verdad para reglas de negocio — reutilízalos, no los reimplementes en componentes ni en rutas API.
- Tras mutar, las actions llaman `revalidatePath` en las rutas afectadas (patrón ya usado en `src/lib/actions/transactions.ts`) — replica esto en nuevas actions.
- Rutas API (`src/app/api/**`) son para integraciones externas futuras (Alexa, OCR) y reusan `src/lib/core` — no dupliques lógica, ver contratos en `README.md`.
- Estado de mantenimiento (`ok`/`warning`/`overdue`) **no se guarda**: se calcula en `src/lib/maintenance/computeStatus.ts` a partir de eventos + reglas. No añadas un campo de estado a la BD.

## Convenciones

- Alias `@/*` → `src/*` (ver `tsconfig.json`).
- Componentes UI reutilizables en `src/components/ui/` (`Button`, `Modal`, `Input`, `Select`, `DatePicker` propio, `Badge`, `EmptyState`, etc.) — usa estos antes de crear primitivas nuevas.
- Formularios: `FormData` nativo parseado en la action + validación Zod contra los schemas de `src/lib/validation/schemas.ts` (pese a estar `react-hook-form` en dependencias, no se usa en el código actual — no lo introduzcas sin comprobar primero si ya se adoptó).
- No hay suite de tests configurada. Verifica cambios con `npm run dev` (probar el flujo real en el navegador) y `npm run lint`; para tipos, `npx tsc --noEmit`.
- Cambios de esquema: editar `prisma/schema.prisma` y correr `npx prisma migrate dev`; luego revisar si `README.md` (sección "Modelo de datos") necesita actualizarse.
- `README.md` documenta el modelo de datos y los contratos de las rutas API — consúltalo antes de tocar `prisma/schema.prisma` o `src/app/api/**`.

## Agentes en paralelo

Dominios independientes en este repo: `calendar`, `categories`, `charts`, `dashboard`, `import`, `items`, `maintenance`, `transactions`, `trips` (cada uno en `src/components/<dominio>` + `src/lib/actions`/`src/lib/core` homónimo).

- Tarea que toca ≥2 dominios sin dependencia entre sí (investigar, revisar, o cambios paralelos independientes): lanza un agente `Explore` (o `general-purpose`/`fork` según corresponda) por dominio, todos en **un mismo mensaje** (varias tool calls a la vez), no secuencial.
- Tarea acotada a 1 archivo/dominio: no lances agente, resuélvelo directo.
- Cambios que comparten un mismo servicio o schema (`src/lib/core/*Service.ts`, `prisma/schema.prisma`): NO paralelizar — son dependientes, hazlo secuencial en el hilo principal.

## Graphify

Preguntas sobre arquitectura, relaciones entre archivos o "cómo encaja X con Y" en este repo: usa skill `graphify` primero (o `/graphify`) en vez de explorar a mano — ya soporta grafo de conocimiento del proyecto. Si existe `graphify-out/`, trátalo como fuente primaria antes de grep manual.

## Comandos

```bash
npm run dev      # servidor de desarrollo
npm run build
npm run lint
npm run seed      # prisma/seed.ts
npx prisma migrate dev
```
