import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/session";
import { requireStripe, stripeConfig, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { brand } from "@/lib/brand";
import { isValidEmail, normalizeEmail } from "@/lib/auth";
import { headers } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  kind: z.enum(["phone", "email"]).default("phone"),
  query: z.string().max(254).default(""),
  email: z.string().min(3).max(254).optional(),
});

export async function POST(req: Request) {
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
  // user typed on Stage 3 — that email already identifies them for the funnel
  // and lets Stripe render a pre-filled Checkout. If neither exists we can't
  // create a subscription.
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

    // Paid-trial pattern. The $29.99 recurring Price is the subscription
    // itself. The $1 one-off Price (STRIPE_TRIAL_PRICE_ID) is attached as an
    // invoice item on the FIRST invoice via `add_invoice_items`, which Stripe
    // collects at checkout even though trial_period_days keeps the
    // subscription free until day 5. Net effect: customer pays $1 today,
    // $29.99 on day 5, then $29.99 every 28 days thereafter.
    const addInvoiceItems = stripeConfig.trialPriceId
      ? [{ price: stripeConfig.trialPriceId, quantity: 1 }]
      : undefined;

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: stripeConfig.priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: brand.trialDurationDays,
        ...(addInvoiceItems ? { add_invoice_items: addInvoiceItems } : {}),
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
  } catch (err) {
    // Return Stripe/Prisma errors to the client so we can see what Stripe
    // actually rejected instead of a generic 500. The returned message is
    // developer-facing; the frontend already wraps it in a user-friendly
    // "payment setup failed" message.
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
