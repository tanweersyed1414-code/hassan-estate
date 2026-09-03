"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ConstructionProject } from "@/db/schema";
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from "@/lib/utils";

const STATUS_VARIANT: Record<string, "success" | "warning" | "neutral"> = {
  PLANNING: "neutral",
  UNDER_CONSTRUCTION: "warning",
  COMPLETED: "success",
};

export function ProjectCard({ project, index = 0 }: { project: ConstructionProject; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0, margin: "0px 0px 300px 0px" }}
      transition={{ duration: 0.5, delay: Math.min(index, 4) * 0.06 }}
      className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-warm-sm transition-shadow duration-300 hover:shadow-warm dark:border-white/[0.06] dark:bg-navy-900"
    >
      <Link href={`/projects/${project.slug}`}>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 dark:bg-white/5">
          {project.featuredImage ? (
            <Image
              src={project.featuredImage}
              alt={project.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-white/15">No Image</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute left-3 top-3">
            <Badge variant={STATUS_VARIANT[project.status] || "neutral"}>
              {PROJECT_STATUS_LABELS[project.status] || project.status}
            </Badge>
          </div>
        </div>
      </Link>
      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-600 dark:text-gold-400">
          {PROJECT_TYPE_LABELS[project.projectType] || project.projectType}
        </p>
        <Link href={`/projects/${project.slug}`}>
          <h3 className="mt-1.5 font-serif-brand text-lg font-medium text-navy-950 transition-colors group-hover:text-gold-600 dark:text-white dark:group-hover:text-gold-300">
            {project.name}
          </h3>
        </Link>
        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-white/50">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{project.location}</span>
        </p>
        <Link
          href={`/projects/${project.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-navy-950 px-4 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-gold-500 dark:bg-white/10"
        >
          View Project <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
