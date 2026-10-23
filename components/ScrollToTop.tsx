"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Jump to the top of the viewport on every pathname change.
 *
 * Next.js's app-router default is to restore the scroll on back/forward
 * and start at 0 on forward navigation, but mobile Safari sometimes
 * holds the previous page's scroll position across soft navigations.
 * This runs once per pathname change (not per query-string change, so a
 * ?paid=1 roundtrip doesn't yank the user around mid-page) and uses
 * `auto` behaviour so it's instant, not animated.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
