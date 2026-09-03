import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-navy-950 placeholder:text-gray-400 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:border-gold-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-navy-900 dark:text-white dark:placeholder:text-white/30",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
