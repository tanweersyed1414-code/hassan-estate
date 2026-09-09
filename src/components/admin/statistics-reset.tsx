"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const OPTIONS = [
  { value: "all", label: "Everything — reset all counts to 0" },
  { value: "older-365d", label: "Only data older than 1 year" },
  { value: "older-90d", label: "Only data older than 3 months" },
] as const;

export function StatisticsReset() {
  const router = useRouter();
  const [scope, setScope] = React.useState<string>("all");
  const [busy, setBusy] = React.useState(false);

  async function run() {
    const label = OPTIONS.find((o) => o.value === scope)?.label ?? scope;
    if (!window.confirm(`Clear page-view statistics: ${label}\n\nThis cannot be undone.`)) return;

    setBusy(true);
    try {
      const res = await fetch("/api/admin/statistics/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      toast.success(scope === "all" ? "Statistics reset." : "Old statistics cleared.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-card rounded-2xl border border-red-200/60 p-5 dark:border-red-500/20">
      <h2 className="font-semibold text-navy-950 dark:text-white">Reset statistics</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
        Permanently delete recorded page views. Use this to start counting fresh.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          disabled={busy}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500 dark:border-white/15 dark:bg-navy-800 dark:text-white sm:max-w-xs"
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          onClick={run}
          disabled={busy}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {busy ? "Clearing…" : "Clear"}
        </button>
      </div>
    </div>
  );
}
