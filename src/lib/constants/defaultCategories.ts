export const DEFAULT_CATEGORIES = [
  { name: "Salario", slug: "salario", icon: "Wallet", color: "#22c55e", subcategories: ["Nómina", "Extra", "Bonus"] },
  { name: "Casa", slug: "casa", icon: "Home", color: "#6366f1", subcategories: ["Hipoteca/Alquiler", "Suministros", "Comunidad", "Reparaciones"] },
  { name: "Coche", slug: "coche", icon: "Car", color: "#0ea5e9", subcategories: ["Combustible", "Seguro", "Mantenimiento", "ITV"] },
  { name: "Ocio", slug: "ocio", icon: "PartyPopper", color: "#f59e0b", subcategories: ["Restaurantes", "Suscripciones", "Eventos"] },
  { name: "Viajes", slug: "viajes", icon: "Plane", color: "#10b981", subcategories: ["Transporte", "Alojamiento", "Actividades"] },
  { name: "Comida", slug: "comida", icon: "ShoppingCart", color: "#ef4444", subcategories: ["Supermercado", "Delivery"] },
] as const;
