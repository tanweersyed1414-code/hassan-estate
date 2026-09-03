"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function StatusSelect({ url, value, options }: { url: string; value: string; options: string[] }) {
  const router = useRouter();
  const [current, setCurrent] = React.useState(value);
  const [loading, setLoading] = React.useState(false);

  async function onChange(next: string) {
    setCurrent(next);
    setLoading(true);
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success("Status updated.");
      router.refresh();
    } catch {
      toast.error("Failed to update status");
      setCurrent(value);
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={current}
      disabled={loading}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500 dark:border-white/15 dark:bg-navy-800 dark:text-white"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
