# Searcher

Rebranded people-lookup web app. Next.js 14 (App Router) + TypeScript + Tailwind.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Structure

- `app/` — Next.js App Router pages
  - `page.tsx` — landing
  - `reverse-phone-lookup/` — phone entry
  - `reverse-email-lookup/` — email entry
  - `results/[kind]/` — animated results page (kind = "phone" | "email")
  - `api/search/phone/` — phone lookup endpoint
  - `api/search/email/` — email lookup endpoint
  - `pricing/`, `signup/`, `login/`, `faq/` — supporting pages
- `components/` — React components
- `lib/`
  - `brand.ts` — single source of truth for name/domain/pricing. Change here to rebrand.
  - `phone.ts` — phone parsing via libphonenumber-js + NANP/UK area-code hints
  - `email.ts` — email validation, free/disposable/role detection, optional HIBP breach lookup
- `_reference/claritycheck.com/` — the original static clone, kept for design reference. Not shipped.

## Environment variables

Optional:

- `HIBP_API_KEY` — HaveIBeenPwned API key. When set, email lookups include real breach counts.

## What works today

- Landing page with animated search input
- Phone lookup: real country, region (US/CA/UK area-code hints), carrier line type (mobile/landline/VoIP/toll-free), E.164/international/national formats
- Email lookup: validation, provider identification, disposable/free/role-account detection, Gravatar URL, breach count (with HIBP key)
- Theatrical multi-step "searching…" animation before results reveal
- Paywall gate on results with $1 trial → $29.99/mo positioning

## Next up

- Auth (NextAuth/Auth.js)
- Stripe subscription with $1 trial
- User dashboard + cancellation flow
- Real data provider integration (Endato / PeopleDataLabs / etc.)
- Rebrand: pick a real name, swap `lib/brand.ts`
