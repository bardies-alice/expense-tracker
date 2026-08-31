import {
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
  TrendingUp,
} from "lucide-react";
import type { ComponentType } from "react";
import { HouseIcon } from "./icons/HouseIcon";

export const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Home: HouseIcon,
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
  TrendingUp,
};

export const ICON_NAMES = Object.keys(ICONS);

export function CategoryIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICONS[name]) || Folder;
  return <Icon className={className} />;
}
