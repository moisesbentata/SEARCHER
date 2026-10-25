import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { brand } from "@/lib/brand";
import { AccountClient } from "./AccountClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: `Account — ${brand.name}`,
};

export default async function AccountPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login?next=/account");
  }

  const account = session.account;

  return (
    <AccountClient
      account={{
        email: account.email,
        subscriptionStatus: account.subscriptionStatus,
        currentPeriodEnd: account.currentPeriodEnd?.toISOString() ?? null,
        trialEndsAt: account.trialEndsAt?.toISOString() ?? null,
        cancelAtPeriodEnd: account.cancelAtPeriodEnd,
        quota: account.monthlyLookupQuota,
        used: account.currentCycleLookupsUsed,
        hasStripeCustomer: !!account.stripeCustomerId,
      }}
    />
  );
}
