"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { track } from "@/lib/track";

export function MetaPageView() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    // Fire a PageView on every navigation (Next.js App Router doesn't
    // reload the Pixel's auto-pageview on client-side route changes).
    track({ type: "PageView" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search?.toString()]);

  return null;
}
