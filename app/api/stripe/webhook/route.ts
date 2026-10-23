import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { requireStripe, stripeConfig, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { brand } from "@/lib/brand";
import { SubscriptionStatus } from "@prisma/client";
import { sendCapiEvent, isMetaConfigured } from "@/lib/meta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Stripe signs webhook bodies against the raw payload — we must NOT let
// Next.js parse JSON on us.
export async function POST(req: Request) {
  if (!isStripeConfigured() || !stripeConfig.webhookSecret) {
    return NextResponse.json(
      { ok: false, error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const stripe = requireStripe();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ ok: false, error: "missing_signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, stripeConfig.webhookSecret);
  } catch (err) {
    console.error("[stripe:webhook] signature verification failed", err);
    return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(s);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.trial_will_end":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscription(sub);
        break;
      }

      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const subId = (inv as unknown as { subscription?: string }).subscription;
        if (typeof subId === "string") {
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncSubscription(sub);
        }
        break;
      }

      default:
        // Unhandled events are ok — Stripe treats a 2xx as "received".
        break;
    }
  } catch (err) {
    console.error("[stripe:webhook] handler error", event.type, err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/**
 * Our Checkout session is in `payment` mode and charges the $1 trial fee.
 * After it completes we create the actual subscription with a 5-day trial,
 * using the payment method the customer saved during Checkout. Stripe will
 * then auto-charge $29.99 every 28 days starting on day 5.
 */
async function handleCheckoutCompleted(s: Stripe.Checkout.Session) {
  const stripe = requireStripe();
  const accountId = s.client_reference_id ?? s.metadata?.accountId;
  if (!accountId) return;

  const customerId = s.customer ? String(s.customer) : null;
  if (!customerId) return;

  // Pull the payment method off the payment intent so we can use it as the
  // subscription's default payment method.
  const paymentIntentId =
    typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id;
  let paymentMethodId: string | null = null;
  if (paymentIntentId) {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    paymentMethodId =
      typeof pi.payment_method === "string"
        ? pi.payment_method
        : pi.payment_method?.id ?? null;
  }

  const flow = s.metadata?.flow;
  if (flow === "trial_fee" && stripeConfig.priceId) {
    // Create the recurring subscription with a 5-day trial. This is the
    // "second step" of our paid-trial pattern — customer already paid the $1
    // via Checkout, now Stripe starts the trial clock and schedules the first
    // $29.99 charge for day 5.
    const sub = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: stripeConfig.priceId, quantity: 1 }],
      trial_period_days: brand.trialDurationDays,
      ...(paymentMethodId ? { default_payment_method: paymentMethodId } : {}),
      metadata: {
        accountId,
        kind: s.metadata?.kind ?? "",
        query: s.metadata?.query ?? "",
      },
    });
    await syncSubscription(sub);
    // Fire Purchase CAPI event. event_id = checkout session id so the
    // client-side Purchase (which uses the same id) dedupes against this
    // one in Meta — belt-and-braces attribution that survives closed tabs
    // and ad blockers.
    await fireTrialPurchaseCapi(s);
    return;
  }

  // Fallback: direct subscription-mode checkout (not used today but kept for
  // forwards-compat with Dashboard-created sessions).
  if (s.subscription) {
    await prisma.account.update({
      where: { id: accountId },
      data: {
        stripeSubscriptionId: String(s.subscription),
        stripeCustomerId: customerId,
      },
    });
  }
}

async function syncSubscription(sub: Stripe.Subscription) {
  const accountId =
    (sub.metadata && sub.metadata.accountId) ||
    (await lookupAccountIdByCustomer(String(sub.customer)));
  if (!accountId) return;

  const status = mapStatus(sub.status);
  const priceId = sub.items.data[0]?.price?.id ?? null;
  const periodEnd =
    (sub as unknown as { current_period_end?: number }).current_period_end;
  const trialEnd = (sub as unknown as { trial_end?: number | null }).trial_end;

  await prisma.account.update({
    where: { id: accountId },
    data: {
      stripeSubscriptionId: sub.id,
      stripeCustomerId: String(sub.customer),
      stripePriceId: priceId ?? undefined,
      subscriptionStatus: status,
      cancelAtPeriodEnd: !!sub.cancel_at_period_end,
      currentPeriodEnd:
        typeof periodEnd === "number" ? new Date(periodEnd * 1000) : undefined,
      trialEndsAt:
        typeof trialEnd === "number" && trialEnd ? new Date(trialEnd * 1000) : undefined,
    },
  });
}

/**
 * Fire a server-side Meta Purchase event for the $1 trial charge.
 *
 * Dedup contract with the client-side Pixel: both legs share event_id =
 * checkout session id, so if the browser also fires Purchase on the
 * `?paid=1` return URL, Meta merges them. If the browser never fires
 * (closed tab, ad-blocker, iOS backgrounded), Meta still gets the
 * conversion from here.
 *
 * Match quality is boosted by hashed email + the _fbp / _fbc cookies
 * captured at Checkout creation time (relayed through session metadata).
 */
async function fireTrialPurchaseCapi(s: Stripe.Checkout.Session): Promise<void> {
  if (!isMetaConfigured()) return;
  const email = s.metadata?.email ?? s.customer_details?.email ?? "";
  if (!email) return;
  try {
    const result = await sendCapiEvent({
      event_name: "Purchase",
      event_id: s.id,
      event_time: Math.floor(Date.now() / 1000),
      action_source: "website",
      event_source_url: `https://${brand.domain}/results/${s.metadata?.kind ?? "phone"}?paid=1&session_id=${s.id}`,
      user_data: {
        email,
        client_ip_address: s.metadata?.clientIp || undefined,
        client_user_agent: s.metadata?.clientUa || undefined,
        fbp: s.metadata?.fbp || undefined,
        fbc: s.metadata?.fbc || undefined,
        external_id: s.metadata?.accountId || undefined,
      },
      custom_data: {
        value: brand.trialPrice,
        currency: brand.currency,
        content_ids: [s.id],
        content_name: "trial_fee",
      },
    });
    if (!result.ok) {
      console.warn("[stripe:webhook] Purchase CAPI not ok", result.error);
    }
  } catch (err) {
    console.warn("[stripe:webhook] Purchase CAPI threw", err);
  }
}

async function lookupAccountIdByCustomer(customerId: string): Promise<string | null> {
  const row = await prisma.account.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });
  return row?.id ?? null;
}

function mapStatus(s: Stripe.Subscription.Status): SubscriptionStatus {
  switch (s) {
    case "trialing":
      return SubscriptionStatus.TRIALING;
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "past_due":
    case "unpaid":
      return SubscriptionStatus.PAST_DUE;
    case "canceled":
    case "incomplete_expired":
      return SubscriptionStatus.CANCELED;
    case "incomplete":
    case "paused":
    default:
      return SubscriptionStatus.NONE;
  }
}
