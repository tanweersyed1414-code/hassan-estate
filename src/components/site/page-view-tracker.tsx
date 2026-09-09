"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * Fires a lightweight, cookieless page-view beacon on every route change.
 * Rendered once in the public site layout — admin pages are never tracked.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const last = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!pathname || pathname === last.current) return;
    last.current = pathname;

    const payload = JSON.stringify({ path: pathname, referrer: document.referrer || "" });
    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return null;
}
