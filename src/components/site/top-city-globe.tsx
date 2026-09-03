"use client";

import * as React from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Globe2, Home as HomeIcon, MapPin, ShieldCheck } from "lucide-react";

const PINS = [
  { top: "28%", left: "62%", label: "Top City-1" },
  { top: "58%", left: "30%", label: "Islamabad" },
  { top: "70%", left: "68%", label: "Rawalpindi" },
];

/**
 * A decorative, self-contained 3D "globe" built entirely from CSS gradients
 * and transforms — no external texture/image dependency. Tilts gently with
 * the pointer for a tactile, 3D feel.
 */
export function TopCityGlobe() {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const springConfig = { stiffness: 120, damping: 20 };
  const rotateX = useSpring(useTransform(y, [0, 1], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(x, [0, 1], [-16, 16]), springConfig);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }
  function handleMouseLeave() {
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto aspect-square w-full max-w-[420px]"
      style={{ perspective: 1400 }}
    >
      <motion.div
        style={{ rotateX: reduceMotion ? 0 : rotateX, rotateY: reduceMotion ? 0 : rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full w-full"
      >
        {/* Orbit ring */}
        <div
          aria-hidden
          className="globe-ring absolute left-1/2 top-1/2 h-[86%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold-300/30"
          style={{ transformStyle: "preserve-3d" }}
        />
        {/* Sphere */}
        <div className="globe-sphere absolute inset-[7%]" aria-hidden />

        {/* Location pins */}
        {PINS.map((pin) => (
          <div
            key={pin.label}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
            style={{ top: pin.top, left: pin.left }}
          >
            <span className="globe-pin flex h-2.5 w-2.5 items-center justify-center rounded-full bg-gold-300" />
            <span className="whitespace-nowrap rounded-full border border-gold-300/30 bg-navy-950/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-gold-200 backdrop-blur-sm">
              {pin.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gold-400/10 blur-3xl"
      />
    </div>
  );
}

const GLOBE_BADGE_ICONS = {
  pin: MapPin,
  globe: Globe2,
  shield: ShieldCheck,
  home: HomeIcon,
} as const;

export function GlobeBadge({
  icon = "pin",
  children,
}: {
  icon?: keyof typeof GLOBE_BADGE_ICONS;
  children: React.ReactNode;
}) {
  const Icon = GLOBE_BADGE_ICONS[icon];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5 text-gold-300" />
      {children}
    </span>
  );
}
