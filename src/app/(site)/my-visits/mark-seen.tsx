"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

/**
 * On mount, tells the server the visitor has seen their visit updates and
 * refreshes so the header's unread dot disappears. Renders nothing.
 */
export function MarkSeen() {
  const router = useRouter();
  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/my-visits/seen", { method: "POST" })
      .then(() => {
        if (!cancelled) router.refresh();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [router]);
  return null;
}
