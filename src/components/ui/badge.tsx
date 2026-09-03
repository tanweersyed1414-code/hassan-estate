import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-navy-950 text-white border-transparent",
        gold: "bg-gold-500 text-navy-950 border-transparent",
        outline: "border-navy-900/20 text-navy-900 bg-white/70 dark:border-white/20 dark:text-white dark:bg-white/5",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
        warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
        danger: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20",
        neutral: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/5 dark:text-white/60 dark:border-white/[0.06]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
