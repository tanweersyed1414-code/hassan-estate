import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&>svg:last-child]:transition-transform [&>svg:last-child]:duration-300 hover:[&>svg:last-child]:translate-x-1",
  {
    variants: {
      variant: {
        // Flips to solid gold on hover — an unmistakable color swap, not just a shade shift.
        default:
          "bg-navy-950 text-white hover:bg-gold-500 hover:text-navy-950 shadow-warm-sm hover:shadow-warm hover:scale-[1.03] active:scale-[0.97] dark:bg-navy-700 dark:hover:bg-gold-500 dark:hover:text-navy-950",
        // Flips to white on hover — gold buttons sit on both light cards and solid dark
        // sections, so the hover state has to read clearly against either.
        gold: "bg-gold-500 text-navy-950 hover:bg-white hover:text-navy-950 shadow-warm-sm hover:-translate-y-0.5 hover:shadow-warm active:translate-y-0",
        // Fills solid on hover instead of just darkening its border.
        outline:
          "border-2 border-navy-950/15 bg-transparent text-navy-950 hover:border-navy-950 hover:bg-navy-950 hover:text-white dark:border-white/25 dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-navy-950",
        outlineLight: "border-2 border-white/50 bg-transparent text-white hover:border-white hover:bg-white hover:text-navy-950",
        ghost: "bg-transparent text-navy-950 hover:bg-navy-950/5 dark:text-white dark:hover:bg-white/10",
        ghostLight: "bg-transparent text-white hover:bg-white/10",
        link: "text-navy-950 underline-offset-4 hover:underline p-0 h-auto rounded-none dark:text-white",
        destructive: "bg-red-600 text-white hover:bg-red-700 hover:scale-[1.03] active:scale-[0.97]",
        // Flips to solid dark navy on hover, same language as `gold`, from a quieter starting point.
        subtle:
          "bg-gray-100 text-navy-950 hover:bg-navy-950 hover:text-white hover:-translate-y-0.5 dark:bg-white/5 dark:text-white dark:hover:bg-gold-500 dark:hover:text-navy-950",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
