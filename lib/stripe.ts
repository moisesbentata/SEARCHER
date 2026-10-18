import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key
  ? new Stripe(key, {
      apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
      typescript: true,
    })
  : null;

export function requireStripe(): Stripe {
  if (!stripe) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return stripe;
}

export const stripeConfig = {
  priceId: process.env.STRIPE_PRICE_ID ?? "",
  trialPriceId: process.env.STRIPE_TRIAL_PRICE_ID ?? "",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
};

export function isStripeConfigured(): boolean {
  return !!stripe && !!stripeConfig.priceId;
}
