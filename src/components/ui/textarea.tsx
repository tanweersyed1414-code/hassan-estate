import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[110px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy-950 placeholder:text-gray-400 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:border-gold-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-navy-900 dark:text-white dark:placeholder:text-white/30",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
