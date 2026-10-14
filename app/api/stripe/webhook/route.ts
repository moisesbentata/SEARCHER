import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { requireStripe, stripeConfig, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { SubscriptionStatus } from "@prisma/client";

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
        const accountId = s.client_reference_id ?? s.metadata?.accountId;
        if (accountId && s.subscription) {
          await prisma.account.update({
            where: { id: accountId },
            data: {
              stripeSubscriptionId: String(s.subscription),
              stripeCustomerId: s.customer ? String(s.customer) : undefined,
            },
          });
        }
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
