import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { brand } from "@/lib/brand";
import { DashboardClient } from "./DashboardClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: `Dashboard — ${brand.name}`,
  // Keep the dashboard out of Google and off the Pixel. Private surface.
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login?next=/dashboard");
  }
  if (!isAdminEmail(session.account.email)) {
    redirect("/account");
  }

  return <DashboardClient />;
}
