import { type SelectHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={clsx(
            "w-full appearance-none rounded-lg border border-border bg-card px-3 py-2 pr-9 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
      </div>
    );
  }
);
