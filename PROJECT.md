# Project — Full Overview

_Working name: **Searcher** (placeholder, rebrandable in one file: `lib/brand.ts`)_
_Status: pre-launch, no revenue yet_
_Last updated: 2026-10-03_
_Founder: moisesbenchoc@gmail.com_

> This is the deep-dive strategic doc. For the short pitch read `ONE_PAGER.md`.
> For the technical state of the codebase read `HANDOFF.md`.

---

## 1. Executive summary

A consumer-facing people-lookup web app in the same category as BeenVerified,
TruthFinder, Instant Checkmate and Spokeo. A rebrand-and-relaunch of
**ClarityCheck**, a product the founder previously ran until losing access
to the Claude account that held the source code. We're rebuilding under a
clean brand with better data sourcing, cleaner legal posture, and a sharper
focus on the single highest-converting buyer segment: the person trying to
find out who their partner is secretly talking to.

Business model: **$1 for a 5-day trial → $29.99 every 28 days until canceled.**

Launch target: $115/mo in data cost, aim for $2k MRR in 90 days post-launch
to justify stepping up to real people-search data providers.

---

## 2. What the product does

### End-to-end user flow

1. User lands on the home page. Sees a search bar, "Reverse Phone Lookup",
   trust-blue palette, dramatic headline, four verification stats with
   source citations.
2. Types a phone number or email, picks a country, hits Lookup.
3. Backend validates in milliseconds (`libphonenumber-js`, real carrier
   data from bundled Google libphonenumber prefix table).
4. User lands in the 6-stage funnel:
   - **Stage 1 (phone only, ~9s)** — "Phone map" card with 3 phases
     counting down, country and carrier revealed, location pinned.
   - **Stage 2 (~104s)** — "Retrieving Owner Information" with the
     cycling blurred avatar, a progress bar, 6 sections scanning in
     sequence (Collecting Data → Scanning Online Posts → App Activity
     → Chat Apps → Social Media → Success). Items check off with
     dramatic variable pacing — some fast, some pause 3-6 seconds on
     "juicy" items (Images, Linked Accounts, Current or Past Profiles,
     Online Activity, Recent Photos, Social Profiles).
   - **Stage 3** — "Results Are Ready" email capture, blurred dashboard
     preview behind, pixelated no-profile avatar top-left suggesting a
     generic unidentified account.
   - **Stage 4** — Paywall. Headline, blurred report preview, social
     proof, benefits, FAQ.
   - **Stage 5** — Payment method chooser (PayPal / Google Pay / Apple
     Pay / credit card) with prominent subscription disclosure.
   - **Stage 6** — Success. Shows the real metadata we derived plus
     the enrichment findings (Gravatar, breach count, sherlock-style
     social presence, GitHub mentions, Wayback captures, domain intel).

### What's real right now

- All validation and formatting (phone + email) — real
- Country / region / carrier / line type via libphonenumber + bundled
  prefix data — real
- Email provider classification + disposable / role flags — real
- Gravatar avatar + public profile — real
- Breach-count via XposedOrNot (free) — real; HIBP paid lookup wired
  behind `HIBP_API_KEY`
- LeakCheck plaintext breach record lookup wired behind `LEAKCHECK_KEY`
- Username presence across 27 public sites (GitHub, Reddit, Twitter,
  Instagram, TikTok, YouTube, Twitch, Pinterest, Medium, DEV,
  StackOverflow, GitLab, Vimeo, SoundCloud, Steam, Spotify, Behance,
  Dribbble, Flickr, Etsy, Venmo, Cash App, Keybase, Patreon, Product
  Hunt, Fiverr, Kick)
- GitHub code / issue search for the query
- Wayback Machine CDX search for archived mentions
- RDAP for domain registrar + age + nameservers
- World map with hoverable regions and real geographic data
- Full 100s dramatic funnel
- Terms and Privacy pages

### What's stubbed and needs real integration

- **Payments** — buttons spin 900ms then jump to Stage 6. No Stripe.
- **Auth** — login / signup pages are decorative. No sessions, no users.
- **Database** — nothing persists. No subscriptions, no history.
- **Email delivery** — Stage 3 email capture goes to URL params. No Resend.
- **Account dashboard + cancellation portal** — doesn't exist yet. FTC
  ROSCA requires this before taking live money.
- **Real people-search provider** (Endato / PeopleDataLabs / Enformion)
  — not wired. Report tier 3 content.

---

## 3. Who buys this (buyer segments)

### Primary — Cheating-partner detective

- Emotional, urgent, specific question driving the search
- "Who is this number my partner keeps texting at 11pm"
- "Is this profile on the dating app real"
- "He said he was working late — who is this contact in his phone"
- High shame, high conversion sensitivity, high LTV because once they
  pay they often stay subscribed and run many lookups across multiple
  numbers over time
- Not price-sensitive at $1 trial
- Primary acquisition channel: Facebook, TikTok, Google — mid-funnel
  retargeting

### Secondary — Fraud / spam-call defender

- "Who is this unknown number calling me"
- "Is this email legit before I click the link"
- Lower emotional charge, lower LTV, but larger addressable market
- Primary channel: SEO, direct-type-in, scam-report blog affiliate

### Tertiary — Reconnection / general curiosity

- Lost contact wanting to find someone
- Checking an old classmate, acquaintance, ex before a reunion
- Low urgency, low LTV, but highly shareable (word of mouth)

### Not our market

- Employers running background checks (FCRA forbids)
- Landlords screening tenants (FCRA forbids)
- Lenders / insurance underwriters (FCRA forbids)
- Journalists / investigators (they have better tools)

---

## 4. Business model and unit economics

### Pricing

| | Charge | Period |
|---|---|---|
| **Trial** | $1.00 | 5 days |
| **Monthly** (billed every 28 days) | $29.99 | ~13 billings/year |

Rationale for 28-day cycles: **13 billings per year instead of 12** = roughly
+$29 extra revenue per customer per year vs. monthly billing, standard
practice in the category and legal with proper disclosure.

### Target unit economics

| Metric | Launch target | Mature target |
|---|---|---|
| CAC (blended, paid + organic) | $45-60 | $35-50 |
| Trial → Paid conversion | 30-40% | 40-50% |
| Avg subscription life (billings) | 3-4 | 5-7 |
| Blended LTV (per trial signup) | $90-140 | $160-220 |
| Gross margin (post-processing) | 55-65% | 70-80% |
| Payback period | ~2 months | ~1 month |

### Revenue model math (conservative)

At 100 trial signups/day, 35% conversion, 4-cycle avg life:

- 100 trials × $1 × 30 days = $3,000/mo trial revenue
- 35 conversions × $29.99 × 4 cycles = $4,199 lifetime revenue per 100
- Steady state ~1,050 active paid subs × $29.99 / 28 days = **~$33,750/mo**
- At $50 CAC × 100 signups × 30 days = $150,000/mo CAC spend
- Net steady state ~**$3k/day revenue, $5k/day CAC, loss-making** at
  this specific set of assumptions — need either lower CAC or higher
  trial-to-paid conversion to be profitable

### Levers

1. **Trial-to-paid conversion** — the single biggest lever. Every
   point above 35% dramatically improves economics.
2. **Churn reduction** — longer avg life. Add real data (Endato) so
   people stay longer because the product delivers more value.
3. **CAC** — SEO + affiliate + content marketing to blend paid down.
4. **ARPU** — add an annual tier ($199/yr or $249/yr with "unlimited
   lookups") for a higher-value upsell at the paywall.

---

## 5. Full product funnel

### Landing page

- Hero: "Reverse Phone Lookup", gradient on "Lookup", soft blue wash
  backdrop
- Phone / Email / Photo / Vehicle / People tabs (only Phone + Email
  are real)
- Unified phone input: flag + country name + divider + Phone Number
  input, live-formatting
- Four stat tiles: 6.4/10 lookups reveal unknown details · 30% of
  Americans admit to cheating · 1/5 of phone-checkers find cheating ·
  $12.5B scam losses — each with cite-able source link
- Everything You Can Uncover — 4 big cards (Phone Info, Owner Info,
  Online Profiles, Risk Indicators)
- Worldwide Data Coverage — real geographic world map, hover-to-reveal
  per-region coverage %, 4 global stats below
- Why People Choose [brand] — 6 numbered benefit cards
- Additional Use Cases — 5-item checklist
- Where [brand] Data Comes From — 6 category tiles
- Accuracy block (97.5% + 3B+ records)
- FAQ — 6 accordion questions
- Bottom CTA — dark hero
- Footer with Terms / Privacy / Opt out and FCRA notice

### Funnel stages (100s total scan time)

Mapped in detail in `HANDOFF.md` §9. Key pacing beats:

- **Stage 1 (phone, 9s)** — rapid validation theater
- **Stage 2 (~104s)** — the "doing real work" theater with dramatic
  pauses on juicy items; progress bar always matches the % value 1:1
  with plateau segments where the % itself pauses
- **Stage 3** — email capture with pixelated no-profile avatar and
  blurred dashboard that reads as a real account view
- **Stage 4** — the paywall
- **Stage 5** — payment chooser (stubbed)
- **Stage 6** — reveals real derived metadata plus Phase-1 enrichment

Every item in Stage 2 that user flagged as "juicy" (Forgotten Profiles,
Current or Past Profiles, Linked Accounts, Images, Recent Photos and
Videos, Online Activity, Social Profiles) is specifically the LAST
item to check off in its section, with the biggest delay in the
schedule allocated to it (3-6.5 seconds).

---

## 6. Tech stack and architecture

- **Framework**: Next.js 14.2 App Router + TypeScript
- **Styling**: Tailwind CSS 3.4, custom `brand` (sky blue) and `accent`
  (royal blue) palettes
- **Phone**: `libphonenumber-js` + bundled Google carrier prefix data
  (`lib/carrier-data.json`, 523 KB, 24k prefixes)
- **Email**: internal classifier (provider, disposable, role, free)
  plus Gravatar via MD5
- **Enrichment** (`lib/enrich/*`):
  - `gravatar.ts` — avatar + public profile
  - `hibp.ts` — Have I Been Pwned paid + XposedOrNot free fallback
  - `leakcheck.ts` — LeakCheck v2 Pro paid tier (plaintext breach records)
  - `domain.ts` — DNS MX + disposable / role flags
  - `sherlock.ts` — 27-site username presence check in parallel
  - `github-search.ts` — GitHub code / issue search
  - `wayback.ts` — Wayback Machine CDX
  - `rdap.ts` — modern WHOIS replacement
- **Map**: d3-geo + topojson-client + `world-atlas` package
- **Deployment**: Vercel (branch `claude/website-clone-relaunch-hksb2q`
  on `moisesbentata/SEARCHER`), auto-deploys on push

### What's not yet in the stack

- **Database**: planning Neon Postgres free tier
- **Auth**: planning NextAuth with email + Google OAuth
- **Payments**: planning Stripe Checkout (hosted) + webhooks
- **Transactional email**: planning Resend
- **Analytics**: planning PostHog
- **Rate limiting / cache**: planning Vercel KV / Upstash

---

## 7. Data sourcing strategy — tiered

### Tier 0 — Shipping right now, free

- Carrier + type + country + region (libphonenumber bundled data)
- Email provider classification + flags (static tables)
- DNS MX + domain registrar + domain age (RDAP, free)
- Gravatar avatar + public profile (free)
- XposedOrNot breach count (free)
- Username presence across 27 sites (Sherlock-style, free)
- GitHub code/issue search for the query (free, 10/min unauth)
- Wayback Machine captures (free)
- Timezone from country code (free)

### Tier 1 — ~$13.50/mo total (recommended first paid tier)

| Provider | Price | Unlocks |
|---|---|---|
| **HIBP** (Pwned 1 annual) | **$3.50/mo** | Real breach names, dates, exposed data classes |
| **LeakCheck** Monthly | **$9.99/mo** (200 queries/day) | Actual leaked plaintext values: names, phones, addresses, DOB, usernames, masked passwords from breach corpus |
| | **~$13.50/mo** | Report goes from "line type" to "here's their actual name, DOB, address, exposed passwords" |

### Tier 2 — ~$45-115/mo (post-launch, more polish)

| Provider | Price | Adds |
|---|---|---|
| LeakCheck Standard | +$20 vs Monthly | 3000 queries/day (vs 200) — supports 5x more paid users |
| Twilio Lookup Caller Name (US) | ~$5-10/mo PAYG | Real US caller name via CNAM database |
| EmailRep Pro | $59/mo | Reliable social presence (replaces our free Sherlock scan) |
| Hunter.io | $34/mo | Email→employer enrichment for professional emails |

### Tier 3 — $300-1500/mo (real people-search)

| Provider | Pricing | Adds |
|---|---|---|
| **Endato** | ~$200-500/mo minimum, $0.10-0.50/match | Owner name, addresses, relatives, past phone numbers — the full BeenVerified-style report |
| **PeopleDataLabs** | ~$500/mo min, $0.05-0.30/match | Global 3B+ profile database, LinkedIn-heavy employment data |
| **Ekata / TransUnion** | enterprise contract $$$$ | Identity verification tier |

### What we don't buy, ever

- Dating-app presence resellers — they're scraping or lying
- Any provider without a verifiable business entity + public pricing
- DMV / financial data via pretext (illegal under DPPA / GLBA)

---

## 8. Legal and compliance posture

### Already in place

- **FCRA notice** in footer on every page — reports may NOT be used
  for employment, credit, housing, insurance, tenancy
- **Terms & Conditions** (`/terms-conditions`) with:
  - 18+ eligibility
  - Enumerated FCRA-prohibited uses
  - Enumerated prohibited behaviors (TCPA auto-dial, scraping, GLBA/
    DPPA data misuse, stalking, harassment)
  - UPPERCASE "AS IS" / "NO WARRANTY" disclaimer
  - UPPERCASE limitation of liability capped at $100 or 12 months fees
  - Indemnification by user
  - Mandatory binding individual arbitration (AAA Consumer Rules)
    with class-action waiver and 30-day opt-out
  - Delaware governing law
- **Privacy Policy** (`/privacy-policy`) with:
  - Three-category collection disclosure
  - Explicit "we don't sell PII for money"
  - CCPA, VCDPA, CPA, CTDPA, UCPA, GDPR, UK, Swiss rights all covered
  - 18+ only, no children's data knowingly collected
- **Subscription auto-renewal disclosure** on Stage 5 (payment) —
  prominent amber card, not buried in a checkmark bullet (this is
  the pattern the FTC has been suing peer sites for)

### Still to-do before accepting live money

- **Cancellation portal** — one-click cancel from account settings
  (FTC ROSCA requirement + California AB 390)
- **Pre-renewal reminder email** — some states require 7-30 days
  notice before auto-renewal
- **EU geo-block** at paywall — GDPR exposure is high in this category
- **Lawyer review** of Terms + Privacy in Delaware (or wherever we
  incorporate)
- **DPA with each paid data provider** (HIBP, LeakCheck, Endato) —
  standard but required
- **Minimum data retention / deletion policy** written and automated
- **State registration** as a seller where required (CA SSL, NY LLC
  foreign filing, etc.)

### Known legal landmines in the category

The FTC has sued peer companies (Spokeo, BeenVerified, PeopleFinder,
Instant Checkmate) for:
- Dark-pattern subscription traps — our prominent disclosure shields
- FCRA-covered use ambiguity — our bold disclaimer shields
- False accuracy claims — our "AS IS no warranty" shields
- Deceptive marketing of free trials — our clear trial language shields

The pattern of enforcement is well-known. We're building to be
cleaner than the sites that got sued.

---

## 9. Competitive landscape

### Direct competitors (same product, same price band)

- **BeenVerified** — public (NASDAQ:TMVD via parent), ~$25/mo
  monthly, massive SEO footprint, has been operating since 2007
- **TruthFinder** — same parent company as Instant Checkmate (The
  Lifetime Value Co, now Keen Decision Inc), $28/mo
- **Instant Checkmate** — $35/mo, sister product to TruthFinder
- **Spokeo** — $20-30/mo, oldest in the category
- **Intelius** — Peoplelooker parent, $19.99-$29.99
- **PeopleFinder** — $19.99-$29.99

All of these are our direct peer set. All of them have been sued by
the FTC and/or state AGs at some point. We assume the same scrutiny
and build cleaner.

### Adjacent competitors

- **Truecaller** — mobile app, free + premium, phone-only, massive
  (300M+ users). Different form factor.
- **ClarityCheck** — our previous product. Now effectively lost to
  the founder but still a competitor if the data is still in Google.

### Why we can win

1. **Cleaner legal posture** — much lower enforcement risk means
   lower insurance cost, lower chance of forced shutdown
2. **Mobile-first UI** — most peers were built in 2010-2015 and look
   it on mobile
3. **Honest subscription disclosure** — reduces chargebacks (industry
   avg in category is 2-5% of transactions; honest disclosure can get
   it under 1%)
4. **Modern tech** — Next.js SSR, instant page loads, no legacy
   PHP/WordPress tech debt
5. **Narrower buyer focus** — we build hard for the cheating-detective
   segment and let that drive conversion while peers try to serve
   everyone

### Why they can win

1. **Data moat** — Endato / PDL contracts take months to secure, we
   don't have one yet
2. **SEO authority** — they've been ranking for "reverse phone
   lookup" for 15+ years
3. **Cash flow** — ongoing operations fund paid acquisition we can't
   match yet
4. **Brand recognition** — BeenVerified has consumer brand recall;
   we don't

---

## 10. Go-to-market

### Phase 1 — Pre-launch (now → first paid user)

- Finalize brand name + register `.com`
- Wire real payments (Stripe)
- Wire real auth
- Wire real database
- Build cancellation portal
- Add EU geo-block
- Lawyer-review Terms / Privacy
- Legal entity (Delaware LLC via Stripe Atlas, $500)
- Soft launch to friends & family for conversion testing

### Phase 2 — Paid test ($500-2k ad spend)

- Facebook campaign targeting "signs partner is cheating" / "unknown
  caller" interest clusters
- TikTok campaign targeting dating-related content viewers
- Google Ads on bottom-funnel reverse-lookup keywords (expensive but
  high intent)
- Measure CAC per channel + trial-to-paid rate
- Kill losers after 72 hours, scale winners

### Phase 3 — SEO investment (3-6 month build)

- Programmatic city/area-code pages ("Reverse phone lookup for area
  code 212 numbers")
- Content: scam-recognition guides, breach-response guides
- Backlink building through comparison roundups

### Phase 4 — Affiliate network

- ShareASale / Impact.com listing
- 20-30% commission on first paid month
- Target scam-report blogs, relationship-advice bloggers, YouTubers

### Phase 5 — Mobile app

- iOS + Android wrapper
- Push notifications for "someone just called you — tap to look up"
- Partner with telephony permissions
- Potentially 3x the LTV via better retention

---

## 11. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| FTC subscription-trap enforcement | High | Clean disclosure, cancellation portal, keep documentation of every billing event |
| Payment processor shuts us down (Stripe de-risks high-chargeback MCCs) | High | Honest trial, 1-click cancel, pre-renewal reminders. Have backup processor (Checkout.com, Paddle) ready. |
| Chargeback rate spikes above 1% | High | Pre-renewal reminder emails, make cancel so easy nobody files a chargeback instead |
| GDPR complaint from EU user | Med | Geo-block at paywall, respect all deletion requests under 30 days |
| Data provider pulls access | Med | Multi-source redundancy, cache aggressively, have replacement wired behind env vars |
| Trial fraud / credit card testing | Med | Stripe Radar + per-IP rate limiting + fraud score threshold |
| Google Ads policy ban on category | Med | Facebook/TikTok+ SEO as primary channels, Google as nice-to-have |
| State AG class-action on misleading claims | High | No fake-source stats, every claim cite-able, no fabricated press mentions |
| Trademark challenge on brand name | Med | Pre-screen names via USPTO + domain + .com registrar check before committing |
| ClarityCheck data breach spill | Low | Rebuild from scratch, no shared infrastructure |

---

## 12. 90 / 180 / 365 day roadmap

### Next 30 days — technical readiness

1. Pick brand name, register .com
2. Add Neon Postgres database
3. Add NextAuth (email + Google)
4. Wire Stripe subscription ($1 trial → $29.99/28d)
5. Build cancellation portal
6. Add Resend for transactional email
7. Add Vercel KV cache for enrichment results (24h TTL)
8. Add per-IP rate limiting on `/api/search/*`
9. EU geo-block at paywall
10. Add HIBP + LeakCheck keys to Vercel (lift tier 1 data)

### 30-90 days — live and testing

1. Lawyer review and incorporation
2. Soft launch with ~$500-2k in paid acquisition
3. Measure trial→paid, iterate on paywall copy
4. Add annual tier ($199/yr) at Stage 4
5. Add PostHog analytics with per-stage funnel tracking
6. Build "re-engagement" email flow (abandoned trial, abandoned
   paywall)

### 90-180 days — scale what works

1. Sign with Endato or PeopleDataLabs (whichever responds first)
2. Scale winning ad channel 10x spend
3. Build out SEO content (20+ programmatic + 10+ long-form posts)
4. Launch affiliate program on ShareASale
5. First hire: performance marketer OR customer success

### 180-365 days — moat building

1. iOS app (TestFlight → App Store)
2. Android app
3. Second product tier (business API)
4. Second geo (UK → EU with GDPR-compliant mode)
5. Reach $100k MRR / $1.2M ARR

---

## 13. Team and ownership

- **Founder**: moisesbenchoc@gmail.com — previously ran ClarityCheck,
  rebuilding under new brand
- **No current employees**
- **No current investors**
- **Legal entity**: not yet formed — plan Delaware LLC via Stripe Atlas

---

## 14. Key links

- **Repo**: `moisesbentata/SEARCHER` on GitHub
- **Dev branch**: `claude/website-clone-relaunch-hksb2q`
- **Deployment**: Vercel project `searcher`, auto-deploy on push
- **Design reference**: `_reference/claritycheck.com` (archived mirror,
  not served)
- **Short pitch**: `ONE_PAGER.md`
- **Technical handoff**: `HANDOFF.md`

---

## 15. Appendix — current cost structure

### Monthly costs (pre-launch)

| Line | Cost |
|---|---|
| Vercel Hobby | $0 |
| GitHub Free | $0 |
| Namecheap domain (after name picked) | ~$1/mo |
| Everything else | $0 |
| **Total** | **~$1/mo** |

### Monthly costs (planned at tier 1 launch)

| Line | Cost |
|---|---|
| Vercel Pro | $20 |
| Neon Postgres | $0 (free tier) |
| Resend | $0 (free tier 3k emails/mo) |
| Stripe | 2.9% + $0.30/txn (not fixed) |
| PostHog | $0 (free tier) |
| Namecheap domain | ~$1/mo |
| **HIBP Pwned 1 annual** | **~$3.50/mo** |
| **LeakCheck Monthly** | **$9.99/mo** |
| **Total fixed** | **~$35/mo + Stripe fees** |

### Monthly costs (planned at ~$10k MRR)

| Line | Cost |
|---|---|
| Vercel Pro | $20 |
| Neon Postgres Scale | ~$29 |
| Resend | $20 (50k emails) |
| Vercel KV | $0-10 |
| HIBP Pwned 2 | ~$15 |
| LeakCheck Lifetime | $70 (one-time) |
| Twilio Lookup PAYG | ~$30 |
| EmailRep Pro | $59 |
| Hunter.io | $34 |
| **Endato minimum contract** | **$300-500** |
| **Total fixed** | **~$550-750/mo** |

At $10k MRR, this is a healthy ~7% COGS. Easily affordable.

---

_End of project doc. Next on the build queue: database → auth → Stripe →
cancellation portal._
