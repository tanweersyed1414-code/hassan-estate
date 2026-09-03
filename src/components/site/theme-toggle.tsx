"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  variant = "onDark",
}: {
  className?: string;
  variant?: "onDark" | "onLight";
}) {
  const [isDark, setIsDark] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage unavailable (private browsing, etc.) — theme just won't persist
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
        variant === "onDark"
          ? "text-white/85 hover:bg-white/10 hover:text-white"
          : "text-navy-800 hover:bg-gray-50 dark:text-white/80 dark:hover:bg-white/10",
        className
      )}
    >
      {mounted && isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
