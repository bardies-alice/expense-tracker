# Mis Gastos

App de gestión de gastos personales (Next.js + Prisma + SQLite). Single-user, sin login.

## Desarrollo

```bash
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

Abrir http://localhost:3000

## Modelo de datos

Ver `prisma/schema.prisma`. Piezas clave: `Category`/`Subcategory`, `Item` (coche/casa/genérico, con `metadata` JSON), `MaintenanceComponent`/`MaintenanceEvent` (reglas y estado de mantenimiento por zona, `zoneKey` mapea a la ficha SVG), `Transaction`/`ExpenseLine` (gastos/ingresos y líneas de producto).

El estado de un componente de mantenimiento (`ok`/`warning`/`overdue`/`unknown`) **no se guarda**: se calcula en `src/lib/maintenance/computeStatus.ts` a partir del último evento y las reglas del componente.

## API — contratos para integraciones futuras

Estas rutas ya funcionan hoy (CRUD real), pero están pensadas para que Alexa y OCR se conecten sin cambios de arquitectura. Reusan la misma lógica que la UI (`src/lib/core`).

### `GET/POST /api/transactions`
CRUD programático de transacciones. `POST` body = mismo shape que `transactionSchema` (`src/lib/validation/schemas.ts`): `{ type, amount, date, categoryId, subcategoryId?, itemId?, notes?, lines?: [{productName, quantity, totalPrice}] }`.

### `GET/PATCH/DELETE /api/transactions/:id`

### `POST /api/webhooks/alexa`
Placeholder para una futura Alexa Skill.
- `{ "type": "expense", "amount": 12.5, "categoryId": "...", "notes"?: "..." }` → crea una `Transaction` con `source=ALEXA`.
- `{ "type": "shopping_item", "productName": "leche" }` → de momento solo confirma recepción (202), no hay lógica de lista de la compra en el MVP.

### `POST /api/receipts`
Placeholder para OCR de tickets. `multipart/form-data` con campos `receipt` (archivo) y `categoryId`. Guarda la imagen en `public/uploads/receipts` y crea una `Transaction` borrador (`amount=0`, `source=OCR`, `receiptImageUrl`). La extracción de líneas de producto (OCR real) se añadirá después actualizando esa misma transacción con `ExpenseLine`.

### `GET/POST /api/maintenance/:componentId/events`
Registra o lista eventos de mantenimiento de un componente por API (pensado para registrar por voz vía Alexa en el futuro). Body `POST`: `{ date, mileageKm?, notes?, cost? }`.
