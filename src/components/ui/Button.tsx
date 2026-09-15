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
