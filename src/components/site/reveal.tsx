"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.01 : 0.6, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0, margin: "0px 0px 300px 0px" }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.1 } },
  };
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0, margin: "0px 0px 300px 0px" }} variants={container} className={className}>
      {children}
    </motion.div>
  );
}
