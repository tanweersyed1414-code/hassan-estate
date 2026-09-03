import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandedLoader({
  label = "Loading...",
  fullScreen = false,
  className,
}: {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-4",
        fullScreen ? "min-h-screen bg-white dark:bg-navy-950" : "min-h-[50vh]",
        className
      )}
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-[3px] border-gray-100 dark:border-white/[0.06]" />
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-gold-500" />
        <Image src="/brand/logo.png" alt="" width={130} height={83} priority className="h-9 w-auto" />
      </div>
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-white/40">{label}</p>
    </div>
  );
}
