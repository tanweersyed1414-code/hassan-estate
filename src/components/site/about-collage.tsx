"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CollageImage {
  src: string;
  alt: string;
}

export function AboutCollage({ images }: { images: CollageImage[] }) {
  return (
    <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-6">
      {images.map((img, i) => (
        <motion.div
          key={img.src + i}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -10, scale: 1.03 }}
          className={cn(
            "relative aspect-[3/4] overflow-hidden rounded-3xl shadow-warm-sm transition-shadow duration-300 hover:shadow-warm",
            i % 2 === 1 && "mt-10",
            i === 3 && "shadow-warm ring-4 ring-gold-400/40"
          )}
        >
          <Image src={img.src} alt={img.alt} fill sizes="240px" className="object-cover" />
        </motion.div>
      ))}
    </div>
  );
}
