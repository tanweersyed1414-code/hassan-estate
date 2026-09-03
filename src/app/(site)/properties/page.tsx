import type { Metadata } from "next";
import Image from "next/image";
import { PropertyCard } from "@/components/site/property-card";
import { PropertyFilters } from "@/components/site/property-filters";
import { PropertySort } from "@/components/site/property-sort";
import { Pagination } from "@/components/site/pagination";
import { getDistinctLocations, getProperties, getSiteSettingsMap } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Properties for Sale & Rent in Top City-1, Islamabad",
  description:
    "Browse residential and commercial plots, houses, apartments, and more in Top City-1, Islamabad and Rawalpindi with Hassan Estates.",
};

type SearchParams = { [key: string]: string | string[] | undefined };

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;

  const filters = {
    city: first(sp.city),
    society: first(sp.society),
    block: first(sp.block),
    category: first(sp.category),
    status: first(sp.status),
    minPrice: sp.minPrice ? Number(first(sp.minPrice)) : undefined,
    maxPrice: sp.maxPrice ? Number(first(sp.maxPrice)) : undefined,
    minArea: sp.minArea ? Number(first(sp.minArea)) : undefined,
    maxArea: sp.maxArea ? Number(first(sp.maxArea)) : undefined,
    bedrooms: sp.bedrooms ? Number(first(sp.bedrooms)) : undefined,
    featured: first(sp.featured) === "true",
    q: first(sp.q),
    sort: (first(sp.sort) as "newest" | "price_asc" | "price_desc" | "featured") || "newest",
    page: sp.page ? Number(first(sp.page)) : 1,
    pageSize: 12,
  };

  const [{ properties, total }, locations, settings] = await Promise.all([
    getProperties(filters),
    getDistinctLocations(),
    getSiteSettingsMap(),
  ]);
  const bannerImage = settings.properties_hero_image || "/demo/hero-banner.jpg";

  const searchParamsRecord: Record<string, string> = {};
  Object.entries(sp).forEach(([k, v]) => {
    const val = first(v);
    if (val) searchParamsRecord[k] = val;
  });

  return (
    <div className="pt-28">
      <div className="relative overflow-hidden bg-navy-950 py-10 text-white">
        <Image src={bannerImage} alt="Properties in Top City-1" fill className="object-cover opacity-35" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 to-navy-950" />
        <div className="section-container relative z-10">
          <p className="eyebrow">Property Listings</p>
          <h1 className="mt-1 font-serif-brand text-3xl font-medium sm:text-4xl">
            Find Your Next Property in Top City-1 &amp; Beyond
          </h1>
        </div>
      </div>

      <div className="section-container flex gap-8 py-10 lg:py-14">
        <PropertyFilters cities={locations.cities} societies={locations.societies} blocks={locations.blocks} total={total} />

        <div className="flex-1">
          <div className="mb-6 hidden items-center justify-between lg:flex">
            <p className="text-sm text-gray-500 dark:text-white/50">{total} propert{total === 1 ? "y" : "ies"} found</p>
            <PropertySort />
          </div>
          <div className="mb-4 flex justify-end lg:hidden">
            <PropertySort />
          </div>

          {properties.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {properties.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 py-20 text-center text-gray-400 dark:border-white/[0.06] dark:text-white/40">
              No properties match your filters. Try adjusting your search.
            </div>
          )}

          <Pagination page={filters.page} pageSize={filters.pageSize} total={total} basePath="/properties" searchParams={searchParamsRecord} />
        </div>
      </div>
    </div>
  );
}
