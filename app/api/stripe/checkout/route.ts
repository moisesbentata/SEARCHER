import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { requireStripe, stripeConfig, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { brand } from "@/lib/brand";
import { headers } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { ok: false, error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const kind: "phone" | "email" = body?.kind === "email" ? "email" : "phone";
  const query: string = typeof body?.query === "string" ? body.query : "";

  const stripe = requireStripe();
  const account = session.account;

  // Create or reuse the Stripe customer so the subscription + billing history
  // live under one record.
  let customerId = account.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: account.email,
      metadata: { accountId: account.id },
    });
    customerId = customer.id;
    await prisma.account.update({
      where: { id: account.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const h = headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    h.get("origin") ??
    `https://${brand.domain}`;

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: stripeConfig.priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: brand.trialDurationDays,
      metadata: { accountId: account.id, kind, query },
    },
    // Hosted-page lets Stripe decide which methods to show per region/device.
    // Methods are enabled in Dashboard → Settings → Payment methods.
    payment_method_collection: "always",
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    client_reference_id: account.id,
    metadata: { accountId: account.id, kind, query },
    success_url: `${origin}/results/${kind}?paid=1&session_id={CHECKOUT_SESSION_ID}&q=${encodeURIComponent(query)}`,
    cancel_url: `${origin}/results/${kind}?paid=0&q=${encodeURIComponent(query)}`,
  });

  return NextResponse.json({ ok: true, url: checkout.url });
}
