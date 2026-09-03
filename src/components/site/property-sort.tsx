"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";

export function PropertySort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "newest";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <Select value={sort} onChange={(e) => onChange(e.target.value)} className="w-auto min-w-[180px]">
      <option value="newest">Newest First</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="featured">Featured</option>
    </Select>
  );
}
