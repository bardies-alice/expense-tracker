import { Home, Car, PartyPopper, Plane, ShoppingCart, Folder, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Home,
  Car,
  PartyPopper,
  Plane,
  ShoppingCart,
};

export function CategoryIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICONS[name]) || Folder;
  return <Icon className={className} />;
}
