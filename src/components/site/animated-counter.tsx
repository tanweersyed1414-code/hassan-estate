"use client";

import * as React from "react";
import { useInView, useMotionValue, useReducedMotion, animate } from "framer-motion";

export function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (!isInView) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(motionValue, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, value, motionValue, reduceMotion]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
