"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PROPERTY_CATEGORY_LABELS } from "@/lib/utils";

const PRICE_RANGES = [
  { label: "Any Price", min: "", max: "" },
  { label: "Under 50 Lac", min: "", max: "5000000" },
  { label: "50 Lac - 1 Crore", min: "5000000", max: "10000000" },
  { label: "1 - 3 Crore", min: "10000000", max: "30000000" },
  { label: "3 Crore+", min: "30000000", max: "" },
];

export function HeroSearch() {
  const router = useRouter();
  const [category, setCategory] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [priceIdx, setPriceIdx] = React.useState(0);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (location) params.set("q", location);
    const range = PRICE_RANGES[priceIdx];
    if (range.min) params.set("minPrice", range.min);
    if (range.max) params.set("maxPrice", range.max);
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col gap-2 rounded-[2rem] border border-gray-100 bg-white p-2 shadow-warm dark:border-white/[0.06] dark:bg-navy-900 sm:flex-row sm:items-center sm:rounded-full"
    >
      <div className="flex-1 sm:border-r sm:border-gray-100 sm:pr-2 sm:dark:border-white/[0.06]">
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Property Type"
          className="h-12 rounded-full border-0 shadow-none focus-visible:ring-0"
        >
          <option value="">Property Type</option>
          {Object.entries(PROPERTY_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location, society or block"
        className="h-12 flex-[1.2] rounded-full bg-transparent px-4 text-sm text-navy-950 placeholder:text-gray-400 focus:outline-none dark:text-white sm:border-r sm:border-gray-100 sm:dark:border-white/[0.06]"
      />
      <div className="flex-1 sm:border-r sm:border-gray-100 sm:pr-2 sm:dark:border-white/[0.06]">
        <Select
          value={priceIdx}
          onChange={(e) => setPriceIdx(Number(e.target.value))}
          aria-label="Price Range"
          className="h-12 rounded-full border-0 shadow-none focus-visible:ring-0"
        >
          {PRICE_RANGES.map((r, i) => (
            <option key={r.label} value={i}>
              {r.label}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" variant="gold" size="lg" className="h-12 shrink-0">
        <Search className="h-4 w-4" /> Search
      </Button>
    </form>
  );
}
