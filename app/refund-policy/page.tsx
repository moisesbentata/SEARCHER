import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Refund Policy — ${brand.name}`,
  description: `${brand.name} refund, cancellation, and billing-dispute policy.`,
};

const LAST_UPDATED = "October 14, 2026";

export default function RefundPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
        Refund &amp; Cancellation Policy
      </h1>
      <p className="mt-2 text-sm text-ink-500">Last updated: {LAST_UPDATED}</p>

      <div className="mt-6 rounded-2xl border border-brand-500/25 bg-brand-50 p-5 text-sm text-ink-800 sm:text-base">
        <strong className="block text-ink-900">The short version</strong>
        <ul className="mt-2 list-disc space-y-1.5 pl-6">
          <li>
            Cancel any time, in one click, from{" "}
            <Link href="/account" className="font-semibold underline">
              your account
            </Link>{" "}
            — no phone call, no email required.
          </li>
          <li>
            Cancelling stops future charges immediately. You keep access until the
            end of the billing period you&apos;ve already paid for.
          </li>
          <li>
            If you were charged by mistake, or you cancelled and were charged
            anyway, email us at{" "}
            <a href={`mailto:${brand.supportEmail}`} className="font-semibold underline">
              {brand.supportEmail}
            </a>{" "}
            and we&apos;ll refund you within 1 business day.
          </li>
        </ul>
      </div>

      <div className="mt-10 space-y-8 text-ink-700">
        <Section n="1" title="Your right to cancel">
          <p>
            You may cancel your {brand.name} subscription at any time. You can
            cancel in three ways:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              In your{" "}
              <Link href="/account" className="underline">
                account dashboard
              </Link>
              , under &ldquo;Manage billing.&rdquo; One click.
            </li>
            <li>
              By emailing{" "}
              <a href={`mailto:${brand.supportEmail}`} className="underline">
                {brand.supportEmail}
              </a>{" "}
              from the address on your account. We confirm within 1 business day.
            </li>
            <li>
              Through the billing portal link sent in every charge receipt.
            </li>
          </ul>
          <p>
            Cancellation takes effect at the end of the billing period you have
            already paid for. You retain full access until that date.
          </p>
        </Section>

        <Section n="2" title="How the $1.00 trial works">
          <p>
            When you start a trial, you are charged{" "}
            {brand.currencySymbol}
            {brand.trialPrice.toFixed(2)} today and immediately gain full access
            to the Service for{" "}
            {brand.trialDurationDays} days.
          </p>
          <p>
            At the end of the {brand.trialDurationDays}-day trial, your
            subscription automatically converts to a recurring membership at{" "}
            {brand.currencySymbol}
            {brand.monthlyPrice.toFixed(2)} every {brand.billingCycleDays} days,
            charged to the same payment method, until you cancel. If you cancel
            at any point before the trial ends, you will not be charged the
            recurring rate.
          </p>
          <p>
            The {brand.currencySymbol}
            {brand.trialPrice.toFixed(2)} trial fee is non-refundable except in
            the circumstances described in Section 4.
          </p>
        </Section>

        <Section n="3" title="Recurring charges">
          <p>
            After the trial period, you will be charged{" "}
            {brand.currencySymbol}
            {brand.monthlyPrice.toFixed(2)} every {brand.billingCycleDays} days.
            Each renewal charge is non-refundable once the new billing period has
            begun, except in the circumstances described in Section 4 and except
            where required by applicable consumer-protection law.
          </p>
          <p>
            We will send a receipt to the email on your account for every charge.
            Each receipt includes a one-click link to cancel future charges.
          </p>
        </Section>

        <Section n="4" title="When we always refund">
          <p>
            We will issue a prompt refund — in most cases within 1 business day —
            in each of these situations:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>You cancelled and were charged anyway.</strong> If you
              cancelled before a billing date and we charged you for the next
              period despite that cancellation, we will refund the charge in
              full.
            </li>
            <li>
              <strong>Duplicate charge.</strong> If you were charged twice for
              the same billing period, we will refund the duplicate.
            </li>
            <li>
              <strong>Unauthorised charge.</strong> If someone used your payment
              method without your permission, email{" "}
              <a href={`mailto:${brand.supportEmail}`} className="underline">
                {brand.supportEmail}
              </a>{" "}
              and we will refund and close the account.
            </li>
            <li>
              <strong>Technical failure.</strong> If a technical failure on our
              side prevented you from using the Service for a sustained period
              during a paid billing cycle, we will refund that cycle.
            </li>
            <li>
              <strong>Statutory right.</strong> If applicable consumer-protection
              law in your jurisdiction (for example, cooling-off periods under
              UK/EU distance-selling regulations) gives you a refund right, we
              will honour it. These rights are additional to anything in this
              policy and are never limited by it.
            </li>
          </ul>
        </Section>

        <Section n="5" title="Discretionary refunds">
          <p>
            Outside the categories in Section 4, we review individual refund
            requests case-by-case and often grant them. If the Service didn&apos;t
            meet your expectations and you want your money back, write us at{" "}
            <a href={`mailto:${brand.supportEmail}`} className="underline">
              {brand.supportEmail}
            </a>{" "}
            and tell us why. We would rather refund an unhappy customer than
            keep the charge.
          </p>
        </Section>

        <Section n="6" title="How to request a refund">
          <p>Email{" "}
            <a href={`mailto:${brand.supportEmail}`} className="underline">
              {brand.supportEmail}
            </a>{" "}
            from the address on your {brand.name} account. Include:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>The approximate date of the charge.</li>
            <li>The last four digits of the card charged, if you know them.</li>
            <li>A brief note about what you&apos;d like refunded and why.</li>
          </ul>
          <p>
            You do not need to argue your case. We respond quickly and typically
            refund the same business day. Refunds post to your original payment
            method and generally appear in 3–10 business days depending on your
            bank or card issuer.
          </p>
        </Section>

        <Section n="7" title="Chargebacks and disputes">
          <p>
            If you believe a charge is wrong, we strongly prefer that you contact
            us first. Chargebacks initiated through your bank or card network
            typically take 30–60 days to resolve and often cost both sides money.
            We can nearly always resolve the issue the same day by email.
          </p>
          <p>
            If you have already filed a chargeback, we will cooperate with your
            bank and will not contest refunds that fall within the categories in
            Section 4.
          </p>
        </Section>

        <Section n="8" title="Changes to this policy">
          <p>
            We may update this policy from time to time. The current version will
            always be posted on this page with its effective date. Changes do not
            affect refund rights for charges made under the previous version.
          </p>
        </Section>

        <Section n="9" title="Contact">
          <p>
            Billing or refund questions:{" "}
            <a href={`mailto:${brand.supportEmail}`} className="underline">
              {brand.supportEmail}
            </a>
            .
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">
        {n}. {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed sm:text-base">
        {children}
      </div>
    </section>
  );
}
