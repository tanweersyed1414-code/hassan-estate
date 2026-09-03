"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroCarouselImage {
  src: string;
  alt: string;
}

export function HeroCarousel({ images, className }: { images: HeroCarouselImage[]; className?: string }) {
  const [active, setActive] = React.useState(0);
  const list = images.filter((i) => i.src);

  React.useEffect(() => {
    if (list.length < 2) return;
    const id = setInterval(() => setActive((a) => (a + 1) % list.length), 5000);
    return () => clearInterval(id);
  }, [list.length]);

  if (list.length === 0) return null;

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <AnimatePresence mode="sync">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image src={list[active].src} alt={list[active].alt} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
        </motion.div>
      </AnimatePresence>

      {list.length > 1 && (
        <div className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex">
          <button
            aria-label="Previous photo"
            onClick={() => setActive((a) => (a - 1 + list.length) % list.length)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-navy-950 shadow-warm-sm transition-colors hover:bg-white"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <div className="flex flex-col gap-2">
            {list.map((img, i) => (
              <button
                key={img.src + i}
                aria-label={`Show photo ${i + 1}`}
                onClick={() => setActive(i)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  i === active ? "h-5 bg-white" : "bg-white/50 hover:bg-white/75"
                )}
              />
            ))}
          </div>
          <button
            aria-label="Next photo"
            onClick={() => setActive((a) => (a + 1) % list.length)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-navy-950 shadow-warm-sm transition-colors hover:bg-white"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
