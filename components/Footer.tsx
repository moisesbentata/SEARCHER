import Link from "next/link";
import { brand } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-ink-900/5 bg-ink-900 text-ink-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-3 text-lg font-semibold text-white">{brand.name}</div>
            <p className="text-sm">{brand.tagline}</p>
          </div>
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-white">Product</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/reverse-phone-lookup" className="hover:text-white">Phone lookup</Link></li>
              <li><Link href="/reverse-email-lookup" className="hover:text-white">Email lookup</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-white">Company</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/help" className="hover:text-white">Help</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-white">Legal</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms-conditions" className="hover:text-white">Terms</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white">Privacy</Link></li>
              <li><Link href="/settings/exclude-phone" className="hover:text-white">Opt out</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 space-y-6 border-t border-white/10 pt-6 text-xs text-ink-400">
          <p className="leading-relaxed">
            {brand.name} compiles information and images from publicly available
            web pages and public records for personal informational purposes
            only. Do not use our services to stalk, harass, dox, or attempt to
            track or monitor any person; image matching, where offered, is
            performed by third-party search engines over publicly available
            images; we do not create or retain facial-recognition templates of
            searched individuals, and do not offer identity verification,
            person-tracking, device monitoring, real-time location or GPS, or
            access to private communications, accounts, or login credentials.
            Results come from public sources, may be incomplete or outdated,
            and are not provided in real time. We are not a consumer or
            credit-reference reporting agency; do not use our information for
            employment, tenancy, credit, insurance, or other eligibility
            decisions. For users in the EEA, {brand.name} acts as a data
            controller and processes publicly available personal data on
            lawful bases including legitimate interests. You have rights of
            access, rectification, erasure, restriction, objection, and
            portability. To exercise your rights or request removal or opt-out,
            follow the opt-out procedure described in our{" "}
            <Link href="/terms-conditions" className="underline hover:text-ink-200">
              Terms &amp; Conditions
            </Link>
            . You may also lodge a complaint with your local Data Protection
            Authority. Only upload images you have the right to share.
          </p>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              © {new Date().getFullYear()} {brand.name}. All rights reserved.
            </div>
            <div>
              Questions or concerns? Email{" "}
              <a
                href={`mailto:${brand.supportEmail}`}
                className="underline hover:text-ink-200"
              >
                {brand.supportEmail}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
