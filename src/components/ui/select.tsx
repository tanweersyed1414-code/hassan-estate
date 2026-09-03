import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "flex h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 py-2 text-sm text-navy-950 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:border-gold-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-navy-900 dark:text-white",
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/40" />
  </div>
));
Select.displayName = "Select";

export { Select };
