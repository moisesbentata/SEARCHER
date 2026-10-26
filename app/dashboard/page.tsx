import { cookies } from "next/headers";
import { DASHBOARD_COOKIE, isDashboardAuthed } from "@/lib/dashboard-auth";
import { brand } from "@/lib/brand";
import { DashboardClient } from "./DashboardClient";
import { DashboardLogin } from "./DashboardLogin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: `Dashboard — ${brand.name}`,
  // Keep the dashboard out of Google and off any crawl. Password gate
  // is the real defence; this is just belt-and-braces.
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  const cookieStore = cookies();
  const authed = isDashboardAuthed(cookieStore.get(DASHBOARD_COOKIE)?.value);
  return authed ? <DashboardClient /> : <DashboardLogin />;
}
