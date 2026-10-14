import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/db";
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
  const lookups = await prisma.lookup.findMany({
    where: { accountId: account.id },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

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
      lookups={lookups.map((l) => ({
        id: l.id,
        kind: l.kind,
        input: l.input,
        createdAt: l.createdAt.toISOString(),
      }))}
    />
  );
}
