"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

export function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = React.useState(0);
  const [lightbox, setLightbox] = React.useState(false);
  const list = images.length ? images : ["/placeholder-property.svg"];

  const next = React.useCallback(() => setActive((a) => (a + 1) % list.length), [list.length]);
  const prev = React.useCallback(() => setActive((a) => (a - 1 + list.length) % list.length), [list.length]);

  React.useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") setLightbox(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, next, prev]);

  // basic swipe support
  const touchStartX = React.useRef(0);
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) prev();
    if (delta < -50) next();
  }

  return (
    <div>
      <div
        className="group relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-white/5"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image src={list[active]} alt={alt} fill priority sizes="(max-width: 1024px) 100vw, 800px" className="object-cover" />
        <button
          onClick={() => setLightbox(true)}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
          aria-label="View fullscreen"
        >
          <Expand className="h-4 w-4" />
        </button>
        {list.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs text-white backdrop-blur">
              {active + 1} / {list.length}
            </div>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === active ? "border-gold-500" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt={`${alt} thumbnail ${i + 1}`} fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <button
              onClick={() => setLightbox(false)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            {list.length > 1 && (
              <button
                onClick={prev}
                className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-8"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            <div className="relative h-[80vh] w-full max-w-5xl">
              <Image src={list[active]} alt={alt} fill sizes="100vw" className="object-contain" />
            </div>
            {list.length > 1 && (
              <button
                onClick={next}
                className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-8"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
