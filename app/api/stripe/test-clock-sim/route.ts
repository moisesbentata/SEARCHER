import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { requireStripe, stripeConfig, isStripeConfigured } from "@/lib/stripe";
import { brand } from "@/lib/brand";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Vercel: test-clock advance usually settles in 10-30s but we give it room.
export const maxDuration = 60;

/**
 * One-shot verifier for the recurring half of the paid-trial pattern.
 *
 * We can't let a real $1 Checkout run its 5 real days to prove the
 * $29.99 charge fires. So instead this endpoint uses Stripe's Test
 * Clocks (test-mode only) to simulate the exact post-Checkout state
 * our webhook creates — card saved as off-session default, 5-day
 * trialing subscription on the recurring price — then jumps the
 * clock past the trial end and reports whether Stripe actually
 * generates and settles the recurring invoice.
 *
 * SAFETY: refuses to run against live keys. The sk_test_ prefix
 * check is first and never bypassable.
 *
 * TEARDOWN: deletes the test clock on both success and failure,
 * which cascades-removes the simulated customer, subscription,
 * payment method, invoices and payment intents.
 *
 * Delete this route before launch — it's a diagnostic, not a
 * production surface.
 */
type Step =
  | { step: string; result: "ok" }
  | { step: string; result: "ok"; data: Record<string, unknown> }
  | { step: string; result: "fail"; data: Record<string, unknown> }
  | { step: string; result: "slow"; data: Record<string, unknown> };

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { ok: false, verdict: "STRIPE_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  // Live-mode guard — this creates real artefacts if run in live mode,
  // which we must never do, so bail out loud.
  const sk = process.env.STRIPE_SECRET_KEY ?? "";
  if (!sk.startsWith("sk_test_")) {
    return NextResponse.json(
      {
        ok: false,
        verdict: "LIVE_MODE_FORBIDDEN",
        detail:
          "test-clock-sim only runs with sk_test_* keys. Flip Stripe to live only AFTER this passes.",
      },
      { status: 403 },
    );
  }

  if (!stripeConfig.priceId) {
    return NextResponse.json(
      { ok: false, verdict: "MISSING_STRIPE_PRICE_ID" },
      { status: 500 },
    );
  }

  const stripe = requireStripe();
  const steps: Step[] = [];
  let clockId: string | null = null;

  try {
    // 1 — Create the clock, frozen at "now".
    const now = Math.floor(Date.now() / 1000);
    const clock = await stripe.testHelpers.testClocks.create({
      frozen_time: now,
      name: `tc-sim-${now}`,
    });
    clockId = clock.id;
    steps.push({
      step: "create_clock",
      result: "ok",
      data: {
        id: clock.id,
        frozenAt: new Date(clock.frozen_time * 1000).toISOString(),
      },
    });

    // 2 — Simulated customer attached to the clock.
    const customer = await stripe.customers.create({
      email: `sim+${now}@tracecheck.co`,
      test_clock: clock.id,
      metadata: { sim: "test-clock-sim" },
    });
    steps.push({
      step: "create_customer",
      result: "ok",
      data: { id: customer.id, email: customer.email ?? "" },
    });

    // 3 — Attach a Visa 4242 test card and make it the default.
    const pm = await stripe.paymentMethods.create({
      type: "card",
      card: { token: "tok_visa" },
    });
    await stripe.paymentMethods.attach(pm.id, { customer: customer.id });
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: pm.id },
    });
    steps.push({
      step: "attach_payment_method",
      result: "ok",
      data: {
        id: pm.id,
        brand: pm.card?.brand ?? "",
        last4: pm.card?.last4 ?? "",
      },
    });

    // 4 — Charge $1 the way Checkout would (off-session save for later).
    const pi = await stripe.paymentIntents.create({
      amount: Math.round(brand.trialPrice * 100),
      currency: brand.currency.toLowerCase(),
      customer: customer.id,
      payment_method: pm.id,
      confirm: true,
      off_session: false,
      setup_future_usage: "off_session",
      description: "sim: trial fee (replaces hosted Checkout)",
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
    });
    if (pi.status !== "succeeded") {
      steps.push({
        step: "charge_trial_fee",
        result: "fail",
        data: { id: pi.id, status: pi.status },
      });
      throw new Error(`trial-fee PI not succeeded: ${pi.status}`);
    }
    steps.push({
      step: "charge_trial_fee",
      result: "ok",
      data: { id: pi.id, amount: pi.amount, status: pi.status },
    });

    // 5 — Mirror handleCheckoutCompleted: create the recurring subscription
    //      with the saved PM and the real trial length.
    const sub = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: stripeConfig.priceId, quantity: 1 }],
      trial_period_days: brand.trialDurationDays,
      default_payment_method: pm.id,
      metadata: { sim: "test-clock-sim" },
    });
    const trialEndIso =
      typeof sub.trial_end === "number"
        ? new Date(sub.trial_end * 1000).toISOString()
        : null;
    steps.push({
      step: "create_subscription",
      result: "ok",
      data: {
        id: sub.id,
        status: sub.status,
        trialEnd: trialEndIso,
        pricePerCycle: formatPrice(sub),
      },
    });

    // 6 — Jump the clock past the trial end so the recurring charge fires.
    const trialEndTs =
      typeof sub.trial_end === "number"
        ? sub.trial_end
        : now + brand.trialDurationDays * 86_400;
    const advanceTo = trialEndTs + 2 * 3600; // 2h after trial end
    await stripe.testHelpers.testClocks.advance(clock.id, {
      frozen_time: advanceTo,
    });

    // 7 — Poll until the clock reports ready (advance is async).
    const started = Date.now();
    let latestClock = await stripe.testHelpers.testClocks.retrieve(clock.id);
    while (latestClock.status === "advancing" && Date.now() - started < 50_000) {
      await new Promise((r) => setTimeout(r, 1500));
      latestClock = await stripe.testHelpers.testClocks.retrieve(clock.id);
    }
    const waitedMs = Date.now() - started;
    if (latestClock.status !== "ready") {
      steps.push({
        step: "advance_clock",
        result: "slow",
        data: {
          finalStatus: latestClock.status,
          waitedMs,
          advancedTo: new Date(advanceTo * 1000).toISOString(),
        },
      });
    } else {
      steps.push({
        step: "advance_clock",
        result: "ok",
        data: {
          waitedMs,
          advancedTo: new Date(advanceTo * 1000).toISOString(),
        },
      });
    }

    // 8 — Pull the subscription back out and check it transitioned to active.
    const subAfter = await stripe.subscriptions.retrieve(sub.id, {
      expand: ["latest_invoice"],
    });
    const latestInvoice =
      typeof subAfter.latest_invoice === "object" && subAfter.latest_invoice
        ? (subAfter.latest_invoice as Stripe.Invoice)
        : null;
    const subscriptionOk = subAfter.status === "active";
    steps.push({
      step: "subscription_after_trial",
      result: subscriptionOk ? "ok" : "fail",
      data: {
        status: subAfter.status,
        cancelAtPeriodEnd: subAfter.cancel_at_period_end,
        latestInvoiceStatus: latestInvoice?.status ?? null,
        latestInvoiceAmountPaid: latestInvoice?.amount_paid ?? null,
        currentPeriodEnd:
          typeof (subAfter as unknown as { current_period_end?: number })
            .current_period_end === "number"
            ? new Date(
                (subAfter as unknown as { current_period_end: number })
                  .current_period_end * 1000,
              ).toISOString()
            : null,
      },
    });

    // 9 — Confirm the recurring invoice landed and was paid (the money shot).
    const invoices = await stripe.invoices.list({
      customer: customer.id,
      limit: 10,
    });
    const recurringCents = Math.round(brand.monthlyPrice * 100);
    const recurringPaid = invoices.data.find(
      (i) =>
        i.status === "paid" &&
        i.amount_paid === recurringCents &&
        !!(i as unknown as { subscription?: string | null }).subscription,
    );
    steps.push({
      step: "recurring_invoice_paid",
      result: recurringPaid ? "ok" : "fail",
      data: {
        looking_for: `${brand.currencySymbol}${brand.monthlyPrice} status=paid`,
        totalInvoices: invoices.data.length,
        statuses: invoices.data.map((i) => ({
          id: i.id,
          status: i.status,
          amountPaid: i.amount_paid,
        })),
      },
    });

    const allPassed = steps.every((s) => s.result === "ok");
    const anyFailed = steps.some((s) => s.result === "fail");
    const verdict = allPassed
      ? "RECURRING_WORKS"
      : anyFailed
        ? "RECURRING_BROKEN"
        : "SLOW_BUT_LIKELY_OK";

    return NextResponse.json({ ok: allPassed, verdict, steps });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    steps.push({ step: "exception", result: "fail", data: { message } });
    return NextResponse.json(
      { ok: false, verdict: "ERROR", steps },
      { status: 500 },
    );
  } finally {
    // Always clean up — the clock cascades everything we created with it.
    if (clockId) {
      try {
        // SDK types the destroy call as `del` for parity with other resources.
        await (
          stripe.testHelpers.testClocks as unknown as {
            del: (id: string) => Promise<unknown>;
          }
        ).del(clockId);
      } catch {
        /* best-effort */
      }
    }
  }
}

function formatPrice(sub: Stripe.Subscription): string {
  const item = sub.items.data[0];
  const amount = item?.price?.unit_amount ?? 0;
  const currency = item?.price?.currency?.toUpperCase() ?? "";
  const interval = item?.price?.recurring?.interval ?? "";
  const count = item?.price?.recurring?.interval_count ?? 1;
  return `${(amount / 100).toFixed(2)} ${currency} / ${count} ${interval}`;
}
