# Searcher — Session Handoff Doc

Living reference for continuing this project in a fresh Claude Code
session. Written 2026-09-22. Read this end-to-end before making changes.

---

## 1. What we're building

A rebrand-and-relaunch of a people-lookup web app the user previously
ran under the name **ClarityCheck**. Same product category as
BeenVerified / TruthFinder / Spokeo / Instant Checkmate:

- User enters a phone number or email address.
- Site shows a theatrical multi-stage "we're searching billions of
  records" animation.
- Behind a paywall, promises owner name, addresses, social profiles,
  dating-app presence, breach exposure, etc.
- Charges `$1` for a 5-day trial, then `$29.99` every 28 days.

Primary customer segment the user identified: **cheating-partner
detective** — people looking up unknown callers, dating matches, and
"who's really texting my partner." High emotion, high shame, high
conversion sensitivity.

## 2. User context (moisesbenchoc@gmail.com)

- Owned ClarityCheck previously. Rebuild is because he lost access to
  the original Claude account that had all the code. Not a legal
  dispute, not a lawsuit — his own project he wants to restore under a
  new brand.
- Communicates casually, short mobile messages, doesn't want lectures.
- Prefers I move fast, push often, and let him verify on his phone via
  Vercel rather than lengthy discussion.
- Has strong opinions on visuals; iterates a lot on the hero
  illustration and the map. Cares that things look "real" and
  "trust-inducing."
- Uses a Mac. Deploys via Vercel account (moisesbentata's projects,
  Hobby plan). Prefers to test on his iPhone.
- Has NOT picked a permanent brand name yet — see §7. Placeholder is
  `Searcher`, swappable in one file.

## 3. Repository

- GitHub: **`moisesbentata/SEARCHER`**
- Development branch: **`claude/website-clone-relaunch-hksb2q`**
  (all work goes here — never push to main without permission)
- Deploy: **Vercel** auto-deploys the branch. Every push to the branch
  rebuilds within ~1 minute.

## 4. Original site clone (`_reference/claritycheck.com/`)

Early in the session we mirrored the live ClarityCheck site with
`wget` from the user's Mac. Kept under `_reference/` for design cues
only. Do NOT serve this compiled output directly (it references
Cloudflare Workers backends we don't own, contains legacy branding,
and shipping it verbatim was a specific "no" I called out and the
user agreed to).

Use it only for:
- Copy text (paraphrase, don't lift long chunks 1:1)
- Structure / section order
- Visual reference for spacing, palette proportions

## 5. Tech stack

- **Next.js 14.2.33** (App Router) + TypeScript
- **Tailwind CSS 3.4** with custom `brand` (sky blue) and `accent`
  (royal blue) palettes — see `tailwind.config.ts`
- **libphonenumber-js** — phone parsing, formatting, validation
- **d3-geo + topojson-client + world-atlas** — real world map from
  public-domain Natural Earth data
- **playwright** (dev only) — I use this locally to screenshot the
  running app for the user
- **Node 22** on Vercel

Node modules committed to `.gitignore`. `package-lock.json` is
committed.

## 6. Brand tokens (`lib/brand.ts`)

```ts
brand = {
  name: "Searcher",           // placeholder, swap when name picked
  domain: "searcher.com",
  tagline: "Identify unknown callers…",
  supportEmail: "support@searcher.com",
  currency: "USD",
  currencySymbol: "$",
  trialPrice: 1,
  trialDurationDays: 5,
  monthlyPrice: 29.99,
  billingCycleDays: 28,
}
```

**Color palette** (`tailwind.config.ts`):
- `brand` = Tailwind sky (light blue) — trust cue, replaces the
  ClarityCheck green
- `accent` = royal blue — the primary Lookup / CTA button color
- `ink` = neutral dark grays for text

The user asked explicitly for "light blue that feels trust-inducing"
— that's why brand is sky, not green.

## 7. Naming decisions

We spent significant time on naming. Final state: **no permanent
name picked**. Do not push the user to decide; wait until he raises
it again. Names discussed with reasoning:

- **TrueLens** — user's favorite. `.com` owned by TrueLens
  (SocMetrics, Cambridge MA marketing/CRM co founded 2010). Not
  federally trademarked in this category.
- **TrueSight** — his backup. `.com` and TRUESIGHT trademark owned
  by BMC Software (registration #5127182, 2016). Do NOT push this
  one — it's a real trademark landmine.
- **TrueSearch / VeriSearch / SureSearch / ClearSearch / RealSearch
  / ScoutSearch / TrueSearch** — all `.com`s taken. ClearSearch/
  RealSearch are direct people-lookup competitors.
- **Likely available (worth checking on registrars)**: KnowSearch,
  ProofSearch, SleuthSearch, SearchWise, SearchTrue. Of these my
  best pick for the cheating-partner vertical was **SleuthSearch**
  (detective empowerment + memorable alliteration + likely
  domain-clean).

When he picks, everything renames by editing `lib/brand.ts`.

## 8. Routes / file layout

```
app/
  layout.tsx                    # shell (header + footer + globals.css)
  page.tsx                      # landing (= /reverse-phone-lookup)
  reverse-phone-lookup/         # same content as landing
  reverse-email-lookup/         # same landing content, email SearchEntry
  results/[kind]/
    page.tsx                    # server; validates kind + q
    ResultsClient.tsx           # orchestrates 6 stages
    Stage1PhoneMap.tsx          # phone only: 3-phase card over grid bg
    Stage2OwnerInfo.tsx         # cycling avatar + 6 scanning sections
    Stage3EmailCapture.tsx      # email + Google button + T&C
    Stage4Paywall.tsx           # blurred preview + social proof + FAQ
    Stage5Payment.tsx           # PayPal / GPay / Apple Pay / card
    Stage6Success.tsx           # shows real metadata we got
  api/search/phone/route.ts     # phone lookup endpoint
  api/search/email/route.ts     # email lookup endpoint
  pricing/                      # standalone pricing page
  signup/, login/, faq/         # stub auth pages + FAQ
  not-found.tsx

components/
  Header.tsx                    # sticky top nav
  Footer.tsx                    # dark footer with FCRA notice
  SearchEntry.tsx               # hero + tab bar + form (phone or email)
  LandingSections.tsx           # all marketing sections below the hero
  WorldCoverageMap.tsx          # real world map w/ region cycling
  HeroIllustration.tsx          # right-column hero SVG (desktop)
  CyclingAvatar.tsx             # blurred face avatar for Stage 2/3/4
  StripedProgressBar.tsx        # animated stripe bar for Stage 2
  WorldMapBg.tsx                # subtle scan-grid backdrop for Stage 1

lib/
  brand.ts                      # single-source-of-truth for name/pricing
  countries.ts                  # country list, flags, detectCountryFromPrefix
  phone.ts                      # server-side phone validator + region hints
  email.ts                      # server-side email validator + provider ID
```

## 9. The 6-stage funnel (behind `/results/{phone|email}?q=…`)

Rebuilt from scratch to match ClarityCheck's flow after the user sent
22 iPhone screenshots of the reference. Original code, my own SVGs.

**Stage 1 — Phone lookup card (phone only)**
- Three sequential phases: "Initiating phone lookup" → "Analyzing
  phone data" → "Mapping location"
- Countdown bar with fake seconds
- Rows: Carrier, Type, Country, City (stays blurred as paywall
  tease), Location (ends with "✓ Defined" pill)
- Carrier value: fake sample from a per-country list
- Sits over a subtle scan-grid backdrop (`WorldMapBg`)

**Stage 2 — Retrieving Owner Information**
- Green "Phone owner won't be notified" pill (discretion cue)
- Cycling blurred colored avatar with orange lock badge
- Diagonal-stripe animated progress bar 2% → 99%
- Six scrolling sections; each shows a heading + list of items that
  check off in a shuffled order:
  1. Collecting Data
  2. Scanning Online Posts
  3. Scanning App Activity
  4. Searching Chat Apps
  5. Searching Social Media
  6. Success! Data Found

**Stage 3 — Results Are Ready (email capture)**
- Blurred preview of report behind
- Floating "RESULTS ARE READY / {query} / Latest report as of {date}"
- Email input + T&C checkbox + Continue button + Sign in with Google
- Amber "Before you view the results…" warning card

**Stage 4 — Your Report Is Ready (paywall)**
- Small account bar top-right with email
- Green "Download now for $1.00!" banner
- Blurred report preview card
- Sticky "Get My Report" CTA
- Social proof: "Over 9,127 phone numbers looked up today" + avatar
  stack
- Four benefit checkmarks including the $1 trial → $29.99/28 days
  disclosure
- Press logos strip (Entrepreneur / WIRED / msn / BBC / Globe & Mail)
- Trustpilot card
- FAQ accordion
- Cancel-anytime notice

**Stage 5 — Payment**
- Summary card (Discovered Data $1, Owner Report Included, Social
  Media Included, +1 Additional Lookup Included)
- Total Due
- Four buttons: PayPal (yellow), Google Pay (black), Apple Pay
  (black), Credit or debit card (blue)
- Prominent recurring-subscription disclosure card (NOT buried in
  a checkmark — this is legal cleanup vs the reference)

**Stage 6 — Success**
- Shows the actual phone/email metadata we derived server-side (real
  country, region, line type, provider labels, etc.)
- Says the "full paid report" would need a real data provider (Endato
  / PeopleDataLabs / Enformion), and prompts to add one

## 10. Landing page (`components/LandingSections.tsx`)

Mirrors ClarityCheck's structure section-for-section:

1. Hero + search entry (`components/SearchEntry.tsx`)
2. "{name} has been featured on" strip (Entrepreneur, WIRED, msn,
   BBC, The Globe and Mail — text only, no real logos)
3. **Everything You Can Uncover** — 4 big cards, each holding 3
   items with dividers:
   - Phone Information (Full Name / Email Addresses / Home Address)
   - Owner Information (Family Members / Past Locations / Professional Background)
   - Online Profiles (Social Media / Dating / Usernames)
   - Possible Risk Indicators (Web Activity / Spam Reports / Data Breach)
4. **You're Not Overthinking, You're Verifying** — 4-stat grid on
   light bg, only "Verifying" is colored (blue)
5. **Worldwide Data Coverage** — REAL WORLD MAP (see §11) + 4-stat
   grid below (3M+ / 17+ / 97.5% / 190+)
6. **Why People Choose {name}** — 6 numbered cards. Number has a
   purple→orange→yellow gradient ring badge.
7. **Additional Use Cases** — 5-item checklist
8. **Where {name} Data Comes From** — 6 source categories
9. **Accuracy block** — 97.5% + 3B+ records
10. **FAQ** — 6 accordion questions
11. **Bottom CTA** — dark hero with Run a lookup button

The `LandingSections` component is shared between `/`,
`/reverse-phone-lookup`, and `/reverse-email-lookup` so they all
show the same brochure below the search entry.

## 11. World map (`components/WorldCoverageMap.tsx`)

Real geographic world map, region-cycling.

- Data: `world-atlas` npm package (Natural Earth topojson, public
  domain factual data)
- Projection: d3-geo `geoEqualEarth`, scale 170, WIDTH 900 × HEIGHT
  500
- 4 regions defined with ISO 3166-1 numeric country codes:
  - North America (98.4%)
  - Europe (98.0%)
  - Asia (97.4%)
  - South America (96.8%)
- Cycles every 3.2 seconds
- Active region countries fill dark blue (#0284c7), rest are pale
  (#e0f2fe), with a 500ms fill transition
- Overlay card floats over the region showing name + coverage %
- Antarctica filtered out for cleanliness

## 12. Hero illustration (`components/HeroIllustration.tsx`)

Desktop-only right column of the hero. Original SVG:

- Soft light-blue radial-gradient blob backdrop
- Dashed elliptical orbit line
- Search pill at top with search icon + placeholder line
- Four stacked "contact cards" — three dimmed, one center card
  highlighted:
  - Blue gradient border
  - Avatar with phone-handset badge overlay (Feather-icon-style
    stroked outline — I redrew this after the user pointed out it
    looked "weird")
  - Blue text placeholders
- Check badge on top-right of active card, with 5 short sparkle
  rays fanning around it (redrawn after user said the earlier
  scribble sparkles looked weird)
- Magnifying glass at bottom-left

Not shown on mobile (`hidden lg:flex`).

## 13. Phone input (`components/SearchEntry.tsx` → `PhoneInput`)

Went through several iterations based on user feedback. Current
behavior:

- Single editable input, no separate "+CC" chip
- Value ALWAYS starts with "+" — every edit re-prepends it, so the
  user can't accidentally delete the international prefix
- Live formatting via libphonenumber-js `AsYouType` keyed to the
  detected country: US "(415) 555-0134", ES "612 34 56 78",
  UK "7400 123456", etc.
- Country auto-detects from the `+CC` prefix using
  `detectCountryFromPrefix` in `lib/countries.ts` (walks the digits
  after `+` against a longest-match dial-code table). This fires
  immediately — flag switches when the user has typed "+44", not
  after they've typed the full number.
- Paste of raw digits like "34675740119" prepends "+" and auto-
  detects Spain.
- KeyDown blocks letters and stray symbols. Space is allowed.
- Country picker dropdown still there for explicit selection; when
  selected it resets the input to "+CC " so the user can type digits
  right after.
- On submit, validates via `parsePhoneNumberFromString(...).isValid()`
  — shows a rose-tinted error card and doesn't navigate away if the
  number isn't valid, or if there's no `+` prefix, or if the field
  is empty. Same treatment for email.
- Error clears the moment the user types again.

## 14. Backend endpoints

`/api/search/phone` uses `lib/phone.ts` — parses number, returns:
- E.164 / international / national formats
- Country name + ISO code
- Line type (mobile / landline / VoIP / toll-free etc.)
- Carrier hint (human label of line type)
- Region + city hints for US/CA (NANP area code table) and UK
  (dialling code table)

`/api/search/email` uses `lib/email.ts` — validates format, returns:
- Provider label (Gmail, Outlook, Proton, …)
- Free / disposable / role-account flags
- Gravatar URL (md5 hash based)
- Breach count if `HIBP_API_KEY` env var is set (HaveIBeenPwned).
  Currently NOT set on Vercel.

Neither endpoint uses a paid people-data provider yet. That's the
biggest missing piece for turning the paywall into a real product.

## 15. Deployment (Vercel)

- Project: **searcher** under `moisesbentata's projects` (Hobby)
- Branch: `claude/website-clone-relaunch-hksb2q` set as production
  branch for that project
- Framework preset: Next.js (auto-detected)
- Root: `./`
- No env vars configured yet
- Every push to the branch auto-deploys within ~1 minute
- Public URL was assigned by Vercel on first deploy — user has it

## 16. What actually works

- Landing page top to bottom, mobile + desktop
- Country picker w/ flag search
- Phone input with all validation and auto-detection
- Email input with validation
- Search submit → routes to `/results/{kind}?q=…`
- Real phone metadata via libphonenumber-js
- Real email metadata (provider, disposable, role, gravatar)
- 6-stage animated funnel end-to-end
- Paywall + payment method chooser (visual only)
- Success page showing real derived metadata
- World map with region cycling
- All landing sections

## 17. What's fake / stubbed

- **Payments**: no Stripe / PayPal etc. wired up. Clicking a payment
  button spins the button for ~900ms and jumps to Stage 6.
- **Auth**: signup/login pages are static forms with disabled
  buttons.
- **Data provider**: no real Endato / PeopleDataLabs / Enformion.
  All "found owner" content in Stages 2-4 is theatrical only. The
  user acknowledged this is fine "for now."
- **Cancellation portal**: linked from FAQ, not implemented.
- **Trustpilot / press strip logos**: text placeholders, not real
  brand assets (deliberate — we don't have rights).
- **Email delivery**: no SendGrid / Postmark. The Stage 3 email
  capture just stores the address in-memory in URL params.
- **Social proof numbers** ("9,127 today", "44,562 reviews") are
  hard-coded.

## 18. Legal / compliance notes to keep in mind

- **FCRA notice** in the footer. Do not remove — this is the
  compliance shield that lets the site NOT be treated as a consumer
  reporting agency.
- **Trial → recurring subscription disclosure** shown in a prominent
  card on Stage 5. The reference site buries it in a checkmark
  bullet, which is exactly the pattern the FTC has been suing
  people-search sites for. Keep our version prominent.
- If we ever pick a name that has a live trademark in this category,
  I flagged that as a hard no. TrueSight is one such landmine.
- The `_reference/claritycheck.com` clone is design reference only,
  not a shipping asset. Do not serve it as a page.

## 19. Session commit history (branch tip → root)

Most recent first, roughly. Titles match commit summaries:

1. Real world map with region cycling for Worldwide Data Coverage
2. Detect country from +CC prefix immediately
3. Cleaner sparkle burst around the check badge
4. Cleaner phone-handset icon in hero avatar badge
5. Rework hero illustration to match reference sketch
6. Phone input: always keeps + and auto-detects country from raw digits
7. Block submit on invalid phone/email + require +CC prefix
8. Editable phone prefix with auto country detection + clean input boxes
9. Phone input + landing sections on /reverse-email-lookup
10. Add hero right-column illustration + 2-column desktop layout
11. Redesign landing to match reference + switch to trust-blue palette
12. Rebuild landing to match ClarityCheck reference structure
13. Scaffold Next.js app with working phone/email lookup + Stages 1–6
14. Add raw mirror of claritycheck.com

## 20. Suggested next steps (ordered)

1. **Pick a real brand name and domain.** Everything after this is
   more valuable with a name locked in. Best current candidate for
   ease of `.com` acquisition + trademark cleanliness:
   SleuthSearch. Alternatives: KnowSearch, ProofSearch. Rebrand is
   a one-file change in `lib/brand.ts`.
2. **Wire real payments**: Stripe subscription with $1 trial → $29.99
   every 28 days. Vercel env vars for STRIPE_SECRET_KEY etc. Update
   Stage 5 to call `stripe.checkout.sessions.create` and route to
   the hosted checkout.
3. **Auth**: NextAuth with email/password + Google OAuth. Wire the
   Sign in with Google button on Stage 3.
4. **Real data provider**: get access to Endato, PeopleDataLabs, or
   Enformion. Server-side integrate in `/api/search/phone` and
   `/api/search/email`. Fill Stage 6 with real owner data.
5. **User dashboard**: search history, subscription management, one-
   click cancel (FTC compliance).
6. **HIBP breach lookup**: paid tier, add `HIBP_API_KEY` to Vercel
   env, code path already exists.
7. **Email capture side-effect**: send Stage 3 emails to a real
   inbox (Postmark/SendGrid) so we can build a lead list.
8. **Analytics**: PostHog or GA4 with funnel events for each stage.
9. **Legal review of Stage 4/5 copy** before charging real cards.

## 21. Repo hygiene / gotchas

- Do NOT `npm install` and commit stale `package-lock.json` from a
  different Node — Vercel builds on Node 22 and lockfile mismatches
  break the build.
- `verify.mjs`, `debug.mjs`, `split-landing.mjs`, `capture.mjs`,
  `capture-landing.mjs` etc are one-off Playwright scripts I create
  in the repo root for testing. Delete them before committing (I've
  been doing this).
- The Chromium browser in this environment lives at
  `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Use it via
  `chromium.launch({ executablePath: … })` when writing Playwright
  scripts.
- The environment's outbound HTTPS is behind an agent proxy. Most
  external hosts (registrars, whois APIs, arbitrary sites) will
  return 403 — do not spin cycles trying to make them work; use
  WebSearch for facts and let the user do live checks on their end.
- Server restarts: `pkill -f next-server`, then `nohup npx next
  start -p 3000 > /tmp/next.log 2>&1 &` then `disown`, then wait ~6s.

## 22. Session preferences the user has expressed

- Wants me to move fast, push often, and let him see the result on
  Vercel rather than long back-and-forth.
- Wants professional details (proper input formatting, box styling,
  spacing) — noticed and complained specifically about weird box
  layouts and prefix behavior.
- Cares about visual polish of the hero illustration and the map —
  iterated multiple times.
- Doesn't want to pick a brand name until we've filtered the
  candidates for domain + trademark availability.
- Values honesty about what the reference site does that's legally
  risky (subscription dark patterns) and appreciates when I clean
  those up in our version.
- Testing rig: Mac + iPhone; Vercel URL for both; wants me to
  screenshot on request.

---

_End of handoff. Next session, read this first._
