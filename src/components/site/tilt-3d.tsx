"use client";

import * as React from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Wraps any card/media in a subtle pointer-tracked 3D tilt. Composes around
 * existing cards (ProjectCard, PropertyCardPremium) without touching their
 * internals — the tilt is applied to an outer perspective layer.
 */
export function Tilt3D({
  children,
  className,
  max = 8,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const springConfig = { stiffness: 260, damping: 22, mass: 0.5 };
  const rotateX = useSpring(useTransform(y, [0, 1], [max, -max]), springConfig);
  const rotateY = useSpring(useTransform(x, [0, 1], [-max, max]), springConfig);
  const translateZ = useSpring(0, springConfig);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
    translateZ.set(12);
  }
  function handleMouseLeave() {
    x.set(0.5);
    y.set(0.5);
    translateZ.set(0);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1200 }}
      className={cn("group", className)}
    >
      <motion.div
        style={{
          rotateX: reduceMotion ? 0 : rotateX,
          rotateY: reduceMotion ? 0 : rotateY,
          translateZ: reduceMotion ? 0 : translateZ,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
