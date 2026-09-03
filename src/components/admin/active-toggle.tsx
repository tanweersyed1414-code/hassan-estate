"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export function ActiveToggle({ url, active }: { url: string; active: boolean }) {
  const router = useRouter();
  const [checked, setChecked] = React.useState(active);
  const [loading, setLoading] = React.useState(false);

  async function onChange(value: boolean) {
    setChecked(value);
    setLoading(true);
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: value }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error("Failed to update status");
      setChecked(!value);
    } finally {
      setLoading(false);
    }
  }

  return <Switch checked={checked} disabled={loading} onCheckedChange={onChange} />;
}
