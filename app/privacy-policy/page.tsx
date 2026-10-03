import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Privacy Policy — ${brand.name}`,
  description: `How ${brand.name} collects, uses, and protects your information.`,
};

const LAST_UPDATED = "October 2, 2026";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-ink-500">Last updated: {LAST_UPDATED}</p>

      <div className="prose prose-ink mt-10 space-y-8 text-ink-700">
        <Section n="1" title="Introduction">
          <p>
            This Privacy Policy describes how {brand.name} (&ldquo;{brand.name},&rdquo;
            &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) collects, uses,
            discloses, and otherwise processes personal information when you access
            or use {brand.domain}, our mobile applications, and related services
            (collectively, the &ldquo;Service&rdquo;). By using the Service you
            consent to the practices described here. If you do not agree, please do
            not use the Service.
          </p>
          <p>
            This Privacy Policy is incorporated into our{" "}
            <Link href="/terms-conditions" className="underline">
              Terms &amp; Conditions
            </Link>
            . Terms used but not defined here have the meanings set forth in the
            Terms.
          </p>
        </Section>

        <Section n="2" title="Information We Collect">
          <p>We collect the following categories of information:</p>
          <h3 className="mt-4 font-semibold text-ink-900">(a) Information you provide to us</h3>
          <ul className="list-disc space-y-1 pl-6">
            <li>Account details such as your name and email address.</li>
            <li>Billing information such as your payment card details, billing address, and transaction history. Payment card numbers are collected and processed by our payment processors and are not stored on our servers.</li>
            <li>Queries you submit, including phone numbers, email addresses, names, usernames, and any other identifiers you search for.</li>
            <li>Communications you send to us, including support requests and feedback.</li>
          </ul>
          <h3 className="mt-4 font-semibold text-ink-900">(b) Information we collect automatically</h3>
          <ul className="list-disc space-y-1 pl-6">
            <li>Device information: IP address, device type, operating system, browser type and version, screen resolution, device identifiers.</li>
            <li>Usage information: pages viewed, time spent, actions taken, referring and exit pages, timestamps, approximate geolocation inferred from IP.</li>
            <li>Cookies, pixels, local storage, and similar tracking technologies.</li>
          </ul>
          <h3 className="mt-4 font-semibold text-ink-900">(c) Information from third parties</h3>
          <ul className="list-disc space-y-1 pl-6">
            <li>Information from our data providers used to populate reports (see Section 3).</li>
            <li>Information from authentication partners if you sign in using a third-party identity provider.</li>
            <li>Information from analytics, advertising, and fraud-prevention partners.</li>
          </ul>
        </Section>

        <Section n="3" title="Public and Third-Party Data Displayed in Reports">
          <p>
            The Service displays information retrieved from publicly-available
            sources (such as government records, telephone directories, open web
            pages, and publicly-indexed social media profiles) and from licensed
            third-party data providers. This information is not personal information
            we collect from you; it is content retrieved on demand in response to
            your query. We make no representation that this third-party content is
            accurate, complete, or current. If you believe information displayed
            about you is inaccurate, please contact us at{" "}
            <a href={`mailto:${brand.supportEmail}`} className="underline">
              {brand.supportEmail}
            </a>
            .
          </p>
        </Section>

        <Section n="4" title="How We Use Information">
          <p>We use the information we collect to:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Provide, operate, and maintain the Service, including processing queries and delivering reports;</li>
            <li>Process payments, manage subscriptions, and send billing-related communications;</li>
            <li>Authenticate users and secure accounts;</li>
            <li>Communicate with you, including sending service, transactional, and marketing messages (you may opt out of marketing messages at any time);</li>
            <li>Improve, personalize, and develop new features of the Service;</li>
            <li>Monitor and analyze usage trends and the performance of the Service;</li>
            <li>Detect, investigate, and prevent fraudulent, abusive, or illegal activity;</li>
            <li>Comply with legal obligations and enforce our Terms;</li>
            <li>Protect our rights, property, and the safety of our users and the public.</li>
          </ul>
        </Section>

        <Section n="5" title="How We Share Information">
          <p>We may share information in the following circumstances:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Service providers.</strong> With third-party vendors who perform
              services on our behalf, such as hosting, payment processing, analytics,
              customer support, and fraud prevention. These parties are permitted to
              use your information only as necessary to perform services for us.
            </li>
            <li>
              <strong>Data providers.</strong> With licensed data providers from whom
              we obtain information to populate reports, in accordance with our
              contractual arrangements with those providers.
            </li>
            <li>
              <strong>Legal and compliance.</strong> When we believe disclosure is
              necessary to comply with any applicable law, regulation, legal process,
              or governmental request, to protect the rights, property, or safety of
              {" "}{brand.name}, our users, or others, or to detect, prevent, or
              address fraud, security, or technical issues.
            </li>
            <li>
              <strong>Business transfers.</strong> In connection with any merger,
              sale of company assets, financing, acquisition, or similar transaction.
            </li>
            <li>
              <strong>With your consent.</strong> For any other purpose with your
              consent.
            </li>
          </ul>
          <p>
            We do not sell your personal information in exchange for monetary
            consideration. Some of our use of cookies and advertising tools may be
            considered a &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; under certain
            state privacy laws; see Section 8 for details on your rights.
          </p>
        </Section>

        <Section n="6" title="Cookies and Tracking Technologies">
          <p>
            We and our partners use cookies, pixels, local storage, software
            development kits, and similar technologies to operate the Service,
            understand how it is used, and personalize your experience. You can
            control cookies through your browser settings, but disabling cookies may
            affect the functionality of the Service.
          </p>
          <p>
            We may use third-party analytics and advertising providers (such as
            Google Analytics and advertising networks) that use these technologies
            to collect information about your use of the Service and other websites
            over time.
          </p>
        </Section>

        <Section n="7" title="Data Retention">
          <p>
            We retain personal information for as long as necessary to provide the
            Service, comply with our legal obligations, resolve disputes, and
            enforce our agreements. Retention periods vary based on the type of
            information and the purposes for which it is collected. You may request
            deletion of your personal information as described in Section 8.
          </p>
        </Section>

        <Section n="8" title="Your Privacy Rights">
          <p>
            Depending on where you reside, you may have certain rights with respect
            to your personal information, including:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>The right to access the personal information we hold about you;</li>
            <li>The right to request correction of inaccurate information;</li>
            <li>The right to request deletion of your personal information;</li>
            <li>The right to opt out of certain uses of your information, including the &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of personal information as those terms are defined by applicable law;</li>
            <li>The right to data portability;</li>
            <li>The right to opt out of marketing communications;</li>
            <li>The right to lodge a complaint with a supervisory authority.</li>
          </ul>
          <p>
            To exercise any of these rights, email{" "}
            <a href={`mailto:${brand.supportEmail}`} className="underline">
              {brand.supportEmail}
            </a>
            . We will respond consistent with applicable law. We may require
            verification of your identity before processing requests. We will not
            discriminate against you for exercising any of these rights.
          </p>
          <p>
            If you are a resident of California, Virginia, Colorado, Connecticut,
            Utah, or any other U.S. state with a comprehensive privacy law, you have
            specific rights under those laws, including the right to opt out of
            targeted advertising and the sale or sharing of personal information.
            Residents of the European Economic Area, the United Kingdom, or
            Switzerland have additional rights under the GDPR and equivalent laws.
          </p>
        </Section>

        <Section n="9" title="Security">
          <p>
            We employ administrative, technical, and physical safeguards designed
            to protect personal information from unauthorized access, use, or
            disclosure. However, no method of transmission over the internet or
            method of electronic storage is one hundred percent secure, and we
            cannot guarantee absolute security. You use the Service at your own
            risk.
          </p>
        </Section>

        <Section n="10" title="International Data Transfers">
          <p>
            {brand.name} is operated from the United States. If you access the
            Service from outside the United States, your information will be
            transferred to, stored, and processed in the United States and other
            countries where our service providers maintain facilities. By using the
            Service, you consent to the transfer of your information to the United
            States, which may have data protection laws different from those in your
            country of residence.
          </p>
        </Section>

        <Section n="11" title="Children&rsquo;s Privacy">
          <p>
            The Service is not directed to individuals under the age of eighteen
            (18), and we do not knowingly collect personal information from
            children. If we become aware that we have collected personal information
            from a child without parental consent, we will take steps to delete that
            information. If you believe we may have collected information from a
            child, please contact us at{" "}
            <a href={`mailto:${brand.supportEmail}`} className="underline">
              {brand.supportEmail}
            </a>
            .
          </p>
        </Section>

        <Section n="12" title="Third-Party Links and Services">
          <p>
            The Service may contain links to third-party websites or services that
            are not operated by us. We are not responsible for the privacy
            practices of those third parties. We encourage you to review their
            privacy policies before providing any personal information.
          </p>
        </Section>

        <Section n="13" title="Changes to this Policy">
          <p>
            We may update this Privacy Policy from time to time. If we make
            material changes, we will post the updated policy on this page and
            update the &ldquo;Last updated&rdquo; date above. Your continued use of
            the Service after the updated policy becomes effective constitutes your
            acceptance of the updated policy.
          </p>
        </Section>

        <Section n="14" title="Contact">
          <p>
            Questions, concerns, or requests regarding this Privacy Policy may be
            sent to{" "}
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
