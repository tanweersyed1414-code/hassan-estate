"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PROPERTY_CATEGORY_LABELS, PROPERTY_STATUS_LABELS } from "@/lib/utils";

interface Props {
  cities: string[];
  societies: string[];
  blocks: string[];
  total: number;
}

function FilterFields({
  values,
  setValues,
  cities,
  societies,
  blocks,
}: {
  values: Record<string, string>;
  setValues: (v: Record<string, string>) => void;
  cities: string[];
  societies: string[];
  blocks: string[];
}) {
  const set = (key: string, v: string) => setValues({ ...values, [key]: v });

  return (
    <div className="space-y-5">
      <div>
        <Label>Property Type</Label>
        <Select value={values.category || ""} onChange={(e) => set("category", e.target.value)}>
          <option value="">All Types</option>
          {Object.entries(PROPERTY_CATEGORY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Status</Label>
        <Select value={values.status || ""} onChange={(e) => set("status", e.target.value)}>
          <option value="">Any Status</option>
          {Object.entries(PROPERTY_STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>City</Label>
        <Select value={values.city || ""} onChange={(e) => set("city", e.target.value)}>
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Society</Label>
        <Select value={values.society || ""} onChange={(e) => set("society", e.target.value)}>
          <option value="">All Societies</option>
          {societies.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Block</Label>
        <Select value={values.block || ""} onChange={(e) => set("block", e.target.value)}>
          <option value="">All Blocks</option>
          {blocks.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Min Price</Label>
          <Input
            type="number"
            placeholder="0"
            value={values.minPrice || ""}
            onChange={(e) => set("minPrice", e.target.value)}
          />
        </div>
        <div>
          <Label>Max Price</Label>
          <Input
            type="number"
            placeholder="Any"
            value={values.maxPrice || ""}
            onChange={(e) => set("maxPrice", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Min Area</Label>
          <Input
            type="number"
            placeholder="0"
            value={values.minArea || ""}
            onChange={(e) => set("minArea", e.target.value)}
          />
        </div>
        <div>
          <Label>Max Area</Label>
          <Input
            type="number"
            placeholder="Any"
            value={values.maxArea || ""}
            onChange={(e) => set("maxArea", e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label>Min Bedrooms</Label>
        <Select value={values.bedrooms || ""} onChange={(e) => set("bedrooms", e.target.value)}>
          <option value="">Any</option>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </Select>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-navy-900 dark:text-white/80">
        <input
          type="checkbox"
          checked={values.featured === "true"}
          onChange={(e) => set("featured", e.target.checked ? "true" : "")}
          className="h-4 w-4 rounded border-gray-300 text-navy-900 focus:ring-gold-500 dark:border-white/20 dark:bg-navy-900"
        />
        Featured Properties Only
      </label>
    </div>
  );
}

export function PropertyFilters({ cities, societies, blocks, total }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  const initial = React.useMemo(() => {
    const obj: Record<string, string> = {};
    searchParams.forEach((v, k) => (obj[k] = v));
    return obj;
  }, [searchParams]);

  const [values, setValues] = React.useState<Record<string, string>>(initial);

  React.useEffect(() => setValues(initial), [initial]);

  function apply(overrides?: Record<string, string>) {
    const merged = { ...values, ...overrides };
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.delete("page");
    router.push(`/properties?${params.toString()}`);
    setOpen(false);
  }

  function reset() {
    setValues({});
    router.push("/properties");
    setOpen(false);
  }

  const activeCount = Object.keys(initial).filter((k) => !["q", "sort", "page"].includes(k) && initial[k]).length;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-28 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-navy-900">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-serif-brand text-lg font-medium text-navy-950 dark:text-white">Filters</h3>
            {activeCount > 0 && (
              <button onClick={reset} className="text-xs font-medium text-gold-600 hover:underline">
                Clear all
              </button>
            )}
          </div>
          <FilterFields values={values} setValues={setValues} cities={cities} societies={societies} blocks={blocks} />
          <Button className="mt-6 w-full" onClick={() => apply()}>
            Apply Filters
          </Button>
        </div>
      </aside>

      {/* Mobile trigger + bottom sheet */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <p className="text-sm text-gray-500 dark:text-white/50">{total} properties found</p>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-4 w-4" /> Filters {activeCount > 0 && `(${activeCount})`}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto p-6 pt-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif-brand text-lg font-medium text-navy-950 dark:text-white">Filters</h3>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:text-white/40 dark:hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
            <FilterFields values={values} setValues={setValues} cities={cities} societies={societies} blocks={blocks} />
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={reset}>
                Reset
              </Button>
              <Button className="flex-1" onClick={() => apply()}>
                Show Results
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
