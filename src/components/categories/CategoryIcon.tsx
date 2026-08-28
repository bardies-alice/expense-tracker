import {
  Home,
  Car,
  PartyPopper,
  Plane,
  ShoppingCart,
  Wallet,
  Briefcase,
  Heart,
  Gift,
  GraduationCap,
  Dumbbell,
  Utensils,
  PawPrint,
  Baby,
  Stethoscope,
  Smartphone,
  Gamepad2,
  Music,
  BookOpen,
  Shirt,
  Wrench,
  Folder,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  Home,
  Car,
  PartyPopper,
  Plane,
  ShoppingCart,
  Wallet,
  Briefcase,
  Heart,
  Gift,
  GraduationCap,
  Dumbbell,
  Utensils,
  PawPrint,
  Baby,
  Stethoscope,
  Smartphone,
  Gamepad2,
  Music,
  BookOpen,
  Shirt,
  Wrench,
  Folder,
};

export const ICON_NAMES = Object.keys(ICONS);

export function CategoryIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICONS[name]) || Folder;
  return <Icon className={className} />;
}
