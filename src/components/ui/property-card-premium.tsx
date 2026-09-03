"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Bath, BedDouble, MapPin, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import { AREA_UNIT_LABELS, formatPKR, PROPERTY_CATEGORY_LABELS } from "@/lib/utils";
import type { Property } from "@/db/schema";
import type { Variants } from "framer-motion";

interface PropertyCardPremiumProps {
  className?: string;
  property: Property;
  index?: number;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

/**
 * A more editorial, animation-forward property card — a distinct visual
 * treatment from the standard catalog `PropertyCard`, used for curated
 * "spotlight" placements rather than the filterable listing grid.
 */
export const PropertyCardPremium = React.forwardRef<HTMLDivElement, PropertyCardPremiumProps>(
  ({ className, property, index = 0, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "group w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-warm-sm transition-shadow duration-300 hover:shadow-warm dark:border-white/[0.06] dark:bg-navy-900",
          className
        )}
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0, margin: "0px 0px 300px 0px" }}
        transition={{ delay: Math.min(index, 4) * 0.08 }}
        whileHover={{ y: -6 }}
        {...props}
      >
        <Link href={`/properties/${property.slug}`} className="block">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-white/5">
            {property.featuredImage ? (
              <Image
                src={property.featuredImage}
                alt={property.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-white/15">No Image</div>
            )}
          </div>
        </Link>

        <div className="space-y-3 p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Link href={`/properties/${property.slug}`}>
              <motion.h3
                variants={textVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="line-clamp-1 font-serif-brand text-lg font-medium tracking-tight text-navy-950 dark:text-white"
              >
                {property.title}
              </motion.h3>
            </Link>
            <motion.p
              variants={textVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="shrink-0 font-serif-brand text-lg font-medium text-navy-950 dark:text-white"
            >
              {formatPKR(property.price)}
            </motion.p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500 dark:text-white/50">
            <motion.div
              variants={textVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.12 }}
              className="flex items-center gap-1.5"
            >
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{property.location || property.city}</span>
            </motion.div>
            <motion.div
              variants={textVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.16 }}
              className="flex items-center gap-3 text-xs"
            >
              <span className="flex items-center gap-1">
                <Ruler className="h-3.5 w-3.5" /> {property.area} {AREA_UNIT_LABELS[property.areaUnit]}
              </span>
              {property.bedrooms > 0 && (
                <span className="flex items-center gap-1">
                  <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms}
                </span>
              )}
              {property.bathrooms > 0 && (
                <span className="flex items-center gap-1">
                  <Bath className="h-3.5 w-3.5" /> {property.bathrooms}
                </span>
              )}
            </motion.div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/[0.06]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-600 dark:text-gold-400">
              {PROPERTY_CATEGORY_LABELS[property.category] || property.category}
            </span>
            <Link
              href={`/properties/${property.slug}`}
              className="flex items-center gap-1 rounded-full bg-navy-950 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gold-500 dark:bg-white/10"
            >
              View Details <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }
);
PropertyCardPremium.displayName = "PropertyCardPremium";
