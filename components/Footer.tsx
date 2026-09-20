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
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs md:flex-row md:items-center md:justify-between">
          <div>
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </div>
          <div className="max-w-2xl text-ink-400">
            <strong className="text-ink-300">FCRA notice:</strong> {brand.name} is not a
            consumer reporting agency. Do not use this service for employment,
            credit, housing, insurance, or any other purpose covered under the
            Fair Credit Reporting Act.
          </div>
        </div>
      </div>
    </footer>
  );
}
