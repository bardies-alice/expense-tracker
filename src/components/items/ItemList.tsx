import Link from "next/link";
import type { Item } from "@prisma/client";
import { EmptyState } from "@/components/ui/EmptyState";

export function ItemList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <EmptyState title="Sin items todavía" description="Añade un coche, casa u otro item para empezar." />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/items/${item.id}`}
          className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
        >
          <p className="text-sm font-medium text-gray-900">{item.name}</p>
          <p className="text-xs text-gray-400">{item.type}</p>
        </Link>
      ))}
    </div>
  );
}
