"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteButton({ url, label = "item", onDeleted }: { url: string; label?: string; onDeleted?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast.success(`${label} deleted.`);
      setOpen(false);
      onDeleted?.();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" title={`Delete ${label}`}>
          <Trash2 className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete {label}?</DialogTitle>
        <DialogDescription>This action cannot be undone.</DialogDescription>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
