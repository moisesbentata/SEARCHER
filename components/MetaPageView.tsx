"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { track } from "@/lib/track";
import { logStage } from "@/lib/funnel";

export function MetaPageView() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    // Fire a PageView on every navigation (Next.js App Router doesn't
    // reload the Pixel's auto-pageview on client-side route changes).
    track({ type: "PageView" });
    // Private funnel log: count landing-page visits (the "top of funnel"
    // number the dashboard uses to compute every downstream conversion
    // rate). Only log for landing/LP routes, not deep pages.
    if (
      pathname === "/" ||
      pathname === "/reverse-phone-lookup" ||
      pathname === "/reverse-email-lookup"
    ) {
      logStage("LANDING");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search?.toString()]);

  return null;
}
