import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const a = session.account;
  const remaining = Math.max(0, a.monthlyLookupQuota - a.currentCycleLookupsUsed);
  return NextResponse.json({
    ok: true,
    account: {
      email: a.email,
      subscriptionStatus: a.subscriptionStatus,
      quota: a.monthlyLookupQuota,
      used: a.currentCycleLookupsUsed,
      remaining,
      currentCycleStart: a.currentCycleStart,
    },
  });
}
