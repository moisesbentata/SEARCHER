import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/session";
import { requireStripe, stripeConfig, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { brand } from "@/lib/brand";
import { isValidEmail, normalizeEmail } from "@/lib/auth";
import { getClientIp, getUserAgent } from "@/lib/request-meta";
import { headers } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  kind: z.enum(["phone", "email"]).default("phone"),
  query: z.string().max(254).default(""),
  email: z.string().min(3).max(254).optional(),
  // Meta attribution cookies — captured on the client and relayed into
  // Stripe metadata so the webhook can fire a Purchase CAPI event with
  // the ad-click already attributed. Max 500 chars each per Stripe limit.
  fbp: z.string().max(500).optional(),
  fbc: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { ok: false, error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // Prefer the logged-in session when present. Fall back to the email the
  // user typed on Stage 3 — the paid funnel doesn't require OTP login.
  const session = await getCurrentSession();
  let account = session?.account ?? null;

  if (!account) {
    const emailRaw = parsed.email;
    if (!emailRaw || !isValidEmail(emailRaw)) {
      return NextResponse.json(
        { ok: false, error: "email_required" },
        { status: 400 },
      );
    }
    const email = normalizeEmail(emailRaw);
    account = await prisma.account.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  }

  // Paid trial requires both prices. Fail fast if the trial price isn't set.
  if (!stripeConfig.trialPriceId) {
    return NextResponse.json(
      {
        ok: false,
        error: "trial_price_missing",
        message: "STRIPE_TRIAL_PRICE_ID env var is not set",
      },
      { status: 500 },
    );
  }

  const stripe = requireStripe();
  const kind = parsed.kind;
  const query = parsed.query;

  try {
    // Create or reuse the Stripe customer so the subscription + billing
    // history live under one record.
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

    // "$1 trial fee → 5-day free access → then $29.99/28d" is implemented as a
    // one-time payment session that collects + saves the card. The webhook
    // handler then creates the subscription with trial_period_days so Stripe
    // takes over the recurring charges automatically from day 5 onwards.
    //
    // Stripe's hosted Checkout in `subscription` mode does NOT support mixing
    // a one-off fee with the recurring price (add_invoice_items is a
    // subscriptions.create param, not a Checkout param), so this two-step
    // pattern is the standard workaround used by every $1-trial subscription
    // product on Stripe.

    // Capture everything the webhook will need to fire a server-side Meta
    // Purchase event — IP, UA, Meta attribution cookies — and shove them
    // into Stripe metadata. The webhook has no browser context of its own
    // so this is the handoff.
    const clientIp = getClientIp(req);
    const clientUa = getUserAgent(req);
    const metaMeta: Record<string, string> = {
      accountId: account.id,
      kind,
      query,
      flow: "trial_fee",
      email: account.email,
    };
    if (clientIp) metaMeta.clientIp = clientIp.slice(0, 64);
    if (clientUa) metaMeta.clientUa = clientUa.slice(0, 500);
    if (parsed.fbp) metaMeta.fbp = parsed.fbp.slice(0, 500);
    if (parsed.fbc) metaMeta.fbc = parsed.fbc.slice(0, 500);

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [{ price: stripeConfig.trialPriceId, quantity: 1 }],
      payment_intent_data: {
        // Save the card so we can bill off-session when the trial ends.
        setup_future_usage: "off_session",
        metadata: {
          accountId: account.id,
          kind,
          query,
          flow: "trial_fee",
        },
      },
      // Hosted-page lets Stripe decide which methods to show per region/device.
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      client_reference_id: account.id,
      metadata: metaMeta,
      success_url: `${origin}/results/${kind}?paid=1&session_id={CHECKOUT_SESSION_ID}&q=${encodeURIComponent(query)}`,
      cancel_url: `${origin}/results/${kind}?paid=0&q=${encodeURIComponent(query)}`,
    });

    return NextResponse.json({ ok: true, url: checkout.url });
  } catch (err) {
    const anyErr = err as {
      message?: string;
      type?: string;
      code?: string;
      param?: string;
      raw?: { message?: string };
    };
    const message =
      anyErr?.raw?.message ??
      anyErr?.message ??
      "Unknown error creating Stripe Checkout session";
    console.error("[stripe:checkout] handler threw", {
      type: anyErr?.type,
      code: anyErr?.code,
      param: anyErr?.param,
      message,
    });
    return NextResponse.json(
      {
        ok: false,
        error: anyErr?.code ?? anyErr?.type ?? "stripe_error",
        message,
      },
      { status: 500 },
    );
  }
}
