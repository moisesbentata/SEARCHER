import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { requireStripe, isStripeConfigured } from "@/lib/stripe";
import { brand } from "@/lib/brand";
import { headers } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { ok: false, error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const session = await getCurrentSession();
  if (!session?.account?.stripeCustomerId) {
    return NextResponse.json(
      { ok: false, error: "no_customer" },
      { status: 400 },
    );
  }

  const stripe = requireStripe();
  const h = headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    h.get("origin") ??
    `https://${brand.domain}`;

  const portal = await stripe.billingPortal.sessions.create({
    customer: session.account.stripeCustomerId,
    return_url: `${origin}/account`,
  });

  return NextResponse.json({ ok: true, url: portal.url });
}
