"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, BedDouble, Bath, Car, MapPin, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/db/schema";
import { AREA_UNIT_LABELS, formatPKR, PROPERTY_CATEGORY_LABELS, PROPERTY_STATUS_LABELS } from "@/lib/utils";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "outline" | "neutral"> = {
  AVAILABLE: "success",
  FOR_SALE: "outline",
  FOR_RENT: "warning",
  SOLD: "danger",
  BOOKING_OPEN: "success",
  COMING_SOON: "neutral",
};

export function PropertyCard({ property, index = 0 }: { property: Property; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0, margin: "0px 0px 300px 0px" }}
      transition={{ duration: 0.5, delay: Math.min(index, 4) * 0.06 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-warm-sm transition-shadow duration-300 hover:shadow-warm dark:border-white/[0.06] dark:bg-navy-900"
    >
      <Link href={`/properties/${property.slug}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-white/5">
          {property.featuredImage ? (
            <Image
              src={property.featuredImage}
              alt={property.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-white/15">No Image</div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {property.isFeatured && <Badge variant="gold">Featured</Badge>}
            <Badge variant={STATUS_VARIANT[property.status] || "neutral"}>
              {PROPERTY_STATUS_LABELS[property.status] || property.status}
            </Badge>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-600 dark:text-gold-400">
          {PROPERTY_CATEGORY_LABELS[property.category] || property.category}
        </p>
        <Link href={`/properties/${property.slug}`}>
          <h3 className="mt-1.5 line-clamp-1 font-serif-brand text-lg font-medium text-navy-950 transition-colors group-hover:text-gold-600 dark:text-white dark:group-hover:text-gold-300">
            {property.title}
          </h3>
        </Link>
        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-white/50">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{property.location || property.city}</span>
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-white/40">
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
          {property.parking > 0 && (
            <span className="flex items-center gap-1">
              <Car className="h-3.5 w-3.5" /> {property.parking}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-white/[0.06]">
          <div>
            <p className="font-serif-brand text-lg font-medium text-navy-950 dark:text-white">{formatPKR(property.price)}</p>
            {property.isNegotiable && <p className="text-[11px] text-gray-400 dark:text-white/35">Negotiable</p>}
          </div>
          <Link
            href={`/properties/${property.slug}`}
            className="flex items-center gap-1.5 rounded-full bg-navy-950 px-4 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-gold-500 dark:bg-white/10"
          >
            View Details <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
