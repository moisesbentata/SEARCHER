import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Terms & Conditions — ${brand.name}`,
  description: `Terms of Service governing use of the ${brand.name} website and services.`,
};

const LAST_UPDATED = "October 2, 2026";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
        Terms &amp; Conditions
      </h1>
      <p className="mt-2 text-sm text-ink-500">Last updated: {LAST_UPDATED}</p>

      <div className="mt-6 rounded-2xl border border-brand-500/25 bg-brand-50 p-5 text-sm text-ink-800 sm:text-base">
        <strong className="block text-ink-900">A note from the team</strong>
        <p className="mt-1.5">
          {brand.name} is an early-stage service built by a small team doing our
          best to deliver something useful and lawful. If you have{" "}
          <strong>any</strong> complaint, concern, question, or request —
          including about your subscription, your data, a report&apos;s content,
          our marketing, our pricing, your privacy, or anything else — please
          email us at{" "}
          <a href={`mailto:${brand.supportEmail}`} className="underline">
            {brand.supportEmail}
          </a>{" "}
          and we will do our genuine best to fix it quickly. We would far rather
          hear from you and resolve things directly than have you remain unhappy.
        </p>
      </div>

      <div className="prose prose-ink mt-10 space-y-8 text-ink-700">
        <Section n="1" title="Acceptance of these Terms">
          <p>
            These Terms &amp; Conditions (the &ldquo;Terms&rdquo;) are a legally
            binding agreement between you and {brand.name} (&ldquo;{brand.name},&rdquo;
            &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) governing your access
            to and use of {brand.domain}, any related subdomains, applications, APIs
            and services (collectively, the &ldquo;Service&rdquo;). By accessing or
            using the Service, by entering a phone number, email address, or any other
            query into the Service, by creating an account, by subscribing, or by
            clicking any button or checkbox indicating acceptance of these Terms, you
            agree to be bound by these Terms and by our{" "}
            <Link href="/privacy-policy" className="underline">
              Privacy Policy
            </Link>
            . If you do not agree, you must not access or use the Service.
          </p>
        </Section>

        <Section n="2" title="Eligibility">
          <p>
            You must be at least eighteen (18) years old (or the age of majority in
            your jurisdiction, whichever is greater) and legally able to enter into a
            binding contract to use the Service. By using the Service, you represent
            and warrant that you meet these requirements and that you have not
            previously been suspended or removed from the Service. The Service is
            intended for use in jurisdictions where it is lawful. You are solely
            responsible for compliance with all applicable local laws.
          </p>
        </Section>

        <Section n="3" title="Not a Consumer Reporting Agency (FCRA Notice)">
          <p className="font-semibold text-ink-900">
            {brand.name} is NOT a consumer reporting agency as defined by the Fair
            Credit Reporting Act, 15 U.S.C. &sect; 1681 et seq. (&ldquo;FCRA&rdquo;),
            and the Service does NOT constitute a &ldquo;consumer report&rdquo; as that
            term is defined by the FCRA.
          </p>
          <p>
            You expressly agree that you will not use the Service, any content
            retrieved via the Service, or any report, record, or information obtained
            from the Service for any of the following purposes, which are strictly
            prohibited (&ldquo;FCRA-Covered Purposes&rdquo;):
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Evaluating a person&apos;s eligibility for employment, promotion, reassignment, or retention as an employee;</li>
            <li>Evaluating a person&apos;s eligibility for credit, lending, insurance underwriting, or any financial transaction initiated by the subject consumer;</li>
            <li>Evaluating a person&apos;s eligibility for housing, residential tenancy, or any rental agreement;</li>
            <li>Evaluating a person&apos;s eligibility for a professional license or benefit granted by a government agency where the agency is required by law to consider the applicant&apos;s financial responsibility or status;</li>
            <li>Evaluating a person&apos;s eligibility for educational scholarships, grants, or financial aid;</li>
            <li>Any other purpose authorized by Section 604 of the FCRA;</li>
            <li>Any use in connection with debt collection, repossession, or dispute resolution;</li>
            <li>Any use that would violate the Gramm-Leach-Bliley Act, the Driver&apos;s Privacy Protection Act, or any similar state or federal law;</li>
            <li>Harassment, stalking, intimidation, surveillance, discrimination, or any other unlawful purpose;</li>
            <li>Any use that would violate the Telephone Consumer Protection Act, including auto-dialing or sending unsolicited text messages to any phone number obtained via the Service.</li>
          </ul>
          <p>
            You are solely responsible for your use of information obtained from the
            Service and you agree to comply with all applicable laws. You acknowledge
            that misuse of information obtained from the Service may expose you to
            civil and criminal liability.
          </p>
        </Section>

        <Section n="4" title="Permitted Use of the Service">
          <p>
            Subject to your continued compliance with these Terms, we grant you a
            limited, non-exclusive, non-transferable, revocable license to access and
            use the Service for your personal, non-commercial use, solely for lawful
            purposes such as satisfying your personal curiosity about the identity of
            an unknown caller, reconnecting with a lost acquaintance, verifying the
            identity of someone you intend to meet in person, or protecting yourself
            from fraud or scams.
          </p>
          <p>
            You will not: (a) use the Service for any purpose listed in Section 3; (b)
            copy, scrape, crawl, index, aggregate, or systematically retrieve data
            from the Service; (c) reverse engineer, decompile, or attempt to extract
            source code from the Service; (d) use robots, bots, spiders, or any
            automated means to access the Service; (e) interfere with or disrupt the
            Service or servers or networks connected to the Service; (f) impersonate
            another person or misrepresent your identity or affiliation; (g) resell,
            sublicense, or redistribute the Service or any report in whole or in part;
            (h) remove any copyright or proprietary notice from any content.
          </p>
        </Section>

        <Section n="5" title="Account Registration and Security">
          <p>
            Certain features of the Service require you to create an account.
            You agree to provide accurate, current, and complete information and to
            keep that information updated. You are responsible for maintaining the
            confidentiality of your login credentials and for all activities that
            occur under your account. You must notify us immediately at{" "}
            <a href={`mailto:${brand.supportEmail}`} className="underline">
              {brand.supportEmail}
            </a>{" "}
            of any unauthorized use. We are not liable for any loss or damage arising
            from your failure to safeguard your credentials.
          </p>
        </Section>

        <Section n="6" title="Subscription, Billing, and Trial Terms">
          <p className="font-semibold text-ink-900">
            Important: the Service operates on an automatically-renewing subscription
            basis.
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Trial.</strong> When you sign up for a trial, you authorize
              us to charge your payment method{" "}
              {brand.currencySymbol}
              {brand.trialPrice.toFixed(2)} for a{" "}
              {brand.trialDurationDays}-day trial period.
            </li>
            <li>
              <strong>Recurring charges.</strong> At the end of the trial period, your
              subscription will automatically renew at{" "}
              {brand.currencySymbol}
              {brand.monthlyPrice.toFixed(2)} every {brand.billingCycleDays} days
              until you cancel. Each renewal will be billed to the payment method on
              file.
            </li>
            <li>
              <strong>Price changes.</strong> We may change the subscription price
              with at least 30 days&apos; notice. Continued use after the effective
              date constitutes acceptance.
            </li>
            <li>
              <strong>Taxes.</strong> Prices do not include taxes. You are responsible
              for all applicable sales, use, VAT, or similar taxes.
            </li>
            <li>
              <strong>Payment authorization.</strong> You authorize us and our
              payment processors to store and charge your payment method for all
              fees owed, including recurring subscription fees, until you cancel.
            </li>
          </ul>
        </Section>

        <Section n="7" title="Cancellation and Refunds">
          <p>
            You may cancel your subscription at any time through your account
            settings, by emailing{" "}
            <a href={`mailto:${brand.supportEmail}`} className="underline">
              {brand.supportEmail}
            </a>
            , or by any other method we provide. Cancellation takes effect at the
            end of the current billing period. You will retain access until that
            period ends.
          </p>
          <p>
            Except where required by applicable law, all fees are non-refundable.
            We may, in our sole discretion, grant refunds or credits in exceptional
            cases; any such accommodation does not obligate us to do so in the
            future.
          </p>
        </Section>

        <Section n="8" title="Third-Party Data and No Warranty of Accuracy">
          <p>
            The Service aggregates and displays information obtained from
            publicly-available sources, licensed data providers, and other third-
            party sources. We do not create, author, or control that information.
            Information in reports may be incomplete, outdated, inaccurate, or
            incorrectly attributed to a particular individual or number. We make no
            representation or warranty that any report will accurately identify or
            match the actual owner of a given phone number or email address. You
            agree not to rely on any report as a basis for any decision having
            legal, financial, or safety consequences.
          </p>
        </Section>

        <Section n="9" title="Intellectual Property">
          <p>
            The Service, including its design, text, graphics, logos, icons,
            software, and other content (excluding third-party data displayed within
            reports), is owned by {brand.name} or its licensors and is protected by
            copyright, trademark, and other laws. You may not use any of our marks
            or branding without our prior written consent.
          </p>
        </Section>

        <Section n="10" title="Disclaimer of Warranties; Early-Stage Service">
          <p>
            {brand.name} is an early-stage service operated by a small team.
            Features may change, be added, be removed, or be temporarily
            unavailable without notice. We make no representation that any
            particular feature, data source, provider integration, pricing, or
            report format will remain available at any time. We may discontinue
            all or part of the Service at any time at our sole discretion.
          </p>
          <p className="uppercase">
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; without warranty of any kind, whether express, implied,
            statutory, or otherwise. To the maximum extent permitted by applicable
            law, {brand.name} and its licensors, affiliates, officers, directors,
            employees, agents, and suppliers disclaim all warranties, including but
            not limited to the implied warranties of merchantability, fitness for a
            particular purpose, title, and non-infringement. We do not warrant that
            the Service will be uninterrupted, error-free, secure, or that defects
            will be corrected, nor do we warrant that any information obtained
            through the Service will be accurate, complete, current, or reliable.
          </p>
          <p className="uppercase">
            Without limiting the foregoing: we do not represent or warrant that
            any report, record, data point, or other information displayed in the
            Service actually relates to, is owned by, is used by, or is otherwise
            connected to any specific individual, including the individual you
            believe you are researching. Information may be misattributed,
            outdated, duplicated, falsified, or incorrect for reasons entirely
            outside our control. You bear sole responsibility for how you
            interpret or act on any information obtained through the Service.
          </p>
        </Section>

        <Section n="11" title="Limitation of Liability">
          <p className="uppercase">
            To the maximum extent permitted by applicable law, in no event will{" "}
            {brand.name}, its licensors, affiliates, officers, directors, employees,
            agents, or suppliers be liable to you or any third party for any
            indirect, incidental, special, consequential, exemplary, or punitive
            damages, including without limitation damages for loss of profits,
            revenue, data, goodwill, or other intangible losses, arising out of or
            relating to your access to or use of (or inability to access or use) the
            Service, any information obtained through the Service, or any conduct
            or content of any third party, whether based on warranty, contract,
            tort (including negligence), statute, or any other legal theory, and
            whether or not we have been advised of the possibility of such damages.
          </p>
          <p className="uppercase">
            In no event will the total aggregate liability of {brand.name} to you
            for all claims arising out of or relating to the Service or these Terms
            exceed the greater of (a) one hundred US dollars (US $100) or (b) the
            total amount actually paid by you to {brand.name} in the twelve (12)
            months immediately preceding the event giving rise to the claim.
          </p>
          <p>
            Some jurisdictions do not allow the exclusion or limitation of certain
            damages. If these laws apply to you, some or all of the above
            disclaimers or limitations may not apply, and you may have additional
            rights.
          </p>
        </Section>

        <Section n="12" title="Indemnification">
          <p>
            You agree to defend, indemnify, and hold harmless {brand.name} and its
            licensors, affiliates, officers, directors, employees, agents, and
            suppliers from and against any and all claims, damages, obligations,
            losses, liabilities, costs, debts, and expenses (including but not
            limited to attorneys&apos; fees) arising from or relating to (a) your
            use of or access to the Service; (b) your violation of any term of
            these Terms; (c) your violation of any third-party right, including
            without limitation any right of privacy, publicity, intellectual
            property right, or any applicable law; or (d) any claim that your use
            of the Service caused damage to a third party. This defense and
            indemnification obligation will survive these Terms and your use of
            the Service.
          </p>
        </Section>

        <Section n="13" title="Dispute Resolution — Mandatory Arbitration; Class Action Waiver">
          <p className="font-semibold">
            Please read this section carefully. It affects your legal rights,
            including your right to a trial by jury and to participate in a class
            action.
          </p>
          <p>
            <strong>Informal resolution first.</strong> Before filing any formal
            legal action, you agree to attempt to resolve any dispute informally by
            contacting{" "}
            <a href={`mailto:${brand.supportEmail}`} className="underline">
              {brand.supportEmail}
            </a>
            . If we cannot resolve the dispute within sixty (60) days, either party
            may pursue arbitration as provided below.
          </p>
          <p>
            <strong>Binding arbitration.</strong> Any dispute, claim, or
            controversy arising out of or relating to these Terms or the Service,
            or the breach, termination, enforcement, interpretation, or validity
            thereof, will be resolved by binding individual arbitration administered
            by the American Arbitration Association (AAA) under its Consumer
            Arbitration Rules. The arbitration will be conducted in the English
            language in the State of Delaware, United States, or at a location
            mutually agreed by the parties, or by videoconference. Judgment on the
            award may be entered in any court having jurisdiction.
          </p>
          <p>
            <strong>Class action waiver.</strong> You and {brand.name} agree that
            each may bring claims against the other only in your or its individual
            capacity, and not as a plaintiff or class member in any purported class
            or representative proceeding. The arbitrator may not consolidate more
            than one person&apos;s claims and may not otherwise preside over any
            form of representative or class proceeding.
          </p>
          <p>
            <strong>Opt-out.</strong> You may opt out of this arbitration agreement
            by sending written notice to{" "}
            <a href={`mailto:${brand.supportEmail}`} className="underline">
              {brand.supportEmail}
            </a>{" "}
            within thirty (30) days of first accepting these Terms. The notice must
            include your name, mailing address, and a clear statement that you wish
            to opt out of arbitration.
          </p>
        </Section>

        <Section n="14" title="Governing Law and Venue">
          <p>
            These Terms are governed by the laws of the State of Delaware, United
            States, without regard to its conflict-of-laws principles. Subject to
            the arbitration provisions above, any court proceedings arising from
            these Terms must be brought exclusively in the state or federal courts
            located in Delaware, and you consent to the personal jurisdiction of
            those courts.
          </p>
        </Section>

        <Section n="15" title="Termination">
          <p>
            We may suspend or terminate your access to all or any part of the
            Service at any time, with or without cause and with or without notice,
            effective immediately. Upon termination, your right to use the Service
            will cease immediately. Sections 3, 8 through 14, and 16 through 18
            will survive any termination.
          </p>
        </Section>

        <Section n="16" title="Changes to the Service and to these Terms">
          <p>
            We may modify, suspend, or discontinue any part of the Service at any
            time without liability. We may revise these Terms from time to time. If
            we make material changes, we will post the revised Terms on this page
            and update the &ldquo;Last updated&rdquo; date above. Your continued use
            of the Service after the revised Terms become effective constitutes
            your acceptance of the revised Terms.
          </p>
        </Section>

        <Section n="17" title="Entire Agreement; Severability; Assignment">
          <p>
            These Terms, together with our Privacy Policy and any other agreement
            or policy incorporated by reference, constitute the entire agreement
            between you and {brand.name} regarding the Service. If any provision
            of these Terms is held invalid or unenforceable, that provision will be
            modified to the minimum extent necessary and the remaining provisions
            will remain in full force and effect. You may not assign these Terms
            without our prior written consent; we may assign these Terms freely.
          </p>
        </Section>

        <Section n="18" title="Contact">
          <p>
            Questions about these Terms may be sent to{" "}
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
