"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { visitStatuses } from "@/lib/validations";

export function VisitDecision({
  id,
  status,
  adminNote,
}: {
  id: number;
  status: string;
  adminNote: string;
}) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = React.useState(status);
  const [note, setNote] = React.useState(adminNote);
  const [saving, setSaving] = React.useState(false);

  const dirty = nextStatus !== status || note !== adminNote;
  const notifies = nextStatus !== status && ["CONFIRMED", "CANCELLED", "COMPLETED"].includes(nextStatus);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/visits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, adminNote: note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      if (data.emailed) toast.success("Updated — visitor emailed.");
      else if (data.emailReason === "not-configured") toast.success("Updated. (Email off — set RESEND_API_KEY.)");
      else if (data.emailReason) toast.warning(`Updated, but email failed (${data.emailReason}).`);
      else toast.success("Updated.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
      setNextStatus(status);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-w-[200px] space-y-2">
      <select
        value={nextStatus}
        onChange={(e) => setNextStatus(e.target.value)}
        disabled={saving}
        className="w-full rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500 dark:border-white/15 dark:bg-navy-800 dark:text-white"
      >
        {visitStatuses.map((o) => (
          <option key={o} value={o}>
            {o.replace("_", " ")}
          </option>
        ))}
      </select>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Note to visitor (included in the email)…"
        className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-navy-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 dark:border-white/15 dark:bg-navy-800 dark:text-white dark:placeholder:text-white/30"
      />
      <button
        onClick={save}
        disabled={!dirty || saving}
        className="w-full rounded-full bg-navy-950 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40 dark:bg-white/10"
      >
        {saving ? "Saving…" : notifies ? "Save & email visitor" : "Save"}
      </button>
    </div>
  );
}
