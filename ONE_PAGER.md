# Searcher — Company & Product 1-Pager

_Last updated 2026-09-23 · Working name "Searcher" (rebrandable in one file, `lib/brand.ts`)_

---

## What the company is

A consumer web app for looking up phone numbers and email addresses to
identify who's behind them. Rebuild-and-relaunch of **ClarityCheck**, a
people-lookup product the founder previously ran; source code was lost with
access to the old Claude account, so we're rebuilding under a fresh brand.

Category: consumer people-search. Peer set: BeenVerified, TruthFinder,
Instant Checkmate, Spokeo.

---

## What the product does — end-to-end

1. **Landing page** with a search bar. User picks Phone or Email and enters
   a value. Real validation (libphonenumber-js), country auto-detects from
   `+CC` prefix, format lives-updates as the user types.
2. **Real backend lookup** on submit:
   - Phone → country, region, city hints, line type (Mobile / Landline /
     VoIP / Toll-free), carrier via Google's bundled libphonenumber
     carrier prefix data.
   - Email → provider, disposable-domain flag, role-account flag,
     Gravatar hash for possible avatar, breach count hook.
3. **Six-stage funnel** — theatrical scan animation matching the reference
   product beat-for-beat:
   1. Phone-map card with three phases (initiating → analyzing → mapping)
   2. Retrieving Owner Information — six sections scan and check off, with
      dramatic pauses on juicy items; total ~100s end-to-end
   3. Results Are Ready — email capture behind a blurred dashboard preview
   4. Blurred report + paywall
   5. Payment method chooser (PayPal / Google Pay / Apple Pay / card)
   6. Success — real derived metadata + upsell into the paid data provider
4. **Behind the paywall** — the full paid report: owner name, addresses,
   relatives, linked emails and phones, social profiles, breach exposure,
   employment, aliases. See §Data below for how each field is sourced.

---

## Who buys this

Primary segment the founder identified: **cheating-partner detective**.
Buyers come with an emotionally loaded, specific question:

- Unknown number keeps calling / texting — who is this
- Matched with someone on a dating app — is this a real profile
- Suspect a partner is talking to someone new — who is the number in
  their phone
- Got a suspicious email — is the sender who they say they are
- Doing an informal background check on a new contact

The combination of **shame + urgency + specificity** drives higher
conversion sensitivity than most consumer verticals. People pay to make
one very specific question go away.

Secondary segments (all real revenue in this category): reconnecting
with lost relatives, verifying new tenants/dates before meeting, spam-
call defense, small-business fraud screening.

---

## Business model

- **Trial**: $1 charged upfront, 5-day access.
- **Recurring**: $29.99 every **28 days** (not monthly — 13 billing
  cycles per year, ~$29 extra vs monthly billing).
- **Cancellation**: must be one-click from an account portal (FTC ROSCA
  requirement — real portal is Phase-2 build).
- **Access**: an unlimited number of new lookups during the paid period.

### Unit economics (planning assumptions)

- Trial signup CAC: $40-60 blended (paid social + SEO/affiliate mix).
- Trial → paid conversion: 30-45% in category (BeenVerified S-1 filings
  guide).
- Avg subscription life once paid: 3-6 billing cycles.
- Blended LTV per trial signup: $110-180 depending on churn.
- Contribution margin target: ≥ 55% after payment processing + data cost.

---

## Data — where the report content comes from

Tiered so we ship free-first, add cost only when it pays for itself.

**Free at scale** (already in the build):
- Carrier / line type / country / region / timezone from libphonenumber
- Email provider, disposable / role flags, format checks
- Gravatar avatar + public profile if the user set one up
- (Phase-1 in progress) HIBP breach count, Sherlock-style username
  presence check across ~30 public sites, Reddit / GitHub public API
  username checks

**Cheap paid — ~$10-50/mo total, Phase 2**:
- HIBP full API $4/mo — breach names + dates + exposed data classes
- DeHashed $6/mo — exposed passwords / emails / phones from breaches
  (this is the juicy reveal moment)
- Emailrep Pro — reputation, blacklist, spam
- Hunter.io — email→domain / employer enrichment
- Twilio Caller Name (US only, ~$0.01/query)

**Real people-search — ~$300-1500/mo, Phase 3**:
- **Endato** (formerly SearchBug / PeopleFinders API) — the canonical
  BeenVerified-style backend. Owner name, home + past addresses,
  relatives, associated numbers and emails.
- **PeopleDataLabs** — 3B+ profile database, enterprise contract.
- Signed with one or the other, the Stage 6 report goes from "line
  type + breach count" to a full identity match.

**Not really available for money**:
- Dating-app presence (Tinder / Bumble). Presented as "not verified" —
  competitors who claim this are scraping or lying.
- Live chat-app registration (WhatsApp / Signal). Not exposed by APIs.

---

## Legal / compliance posture

- **FCRA disclaimer** in the footer. Reports may NOT be used for
  employment, credit, housing, insurance, or any decision governed by
  the Fair Credit Reporting Act.
- **Subscription disclosure** prominent on the Payment stage (Stage 5)
  — trial length, recurring price, billing cadence, cancellation
  method. Not buried in a checkmark bullet. This is the pattern the
  FTC has been suing our category for; we're deliberately cleaner.
- **Cancellation** must be as easy as signup (FTC ROSCA + California
  AB 390). One-click portal — Phase-2 build.
- **GDPR** — this whole product category is essentially illegal in the
  EU without opt-in from every data subject. Plan: geo-block EU users
  at the paywall (Phase 2), or serve a stripped "only self-published
  data" mode there.
- **GLBA / DPPA** — do not pretext, do not touch DMV or bank data.
- **TCPA** — no auto-dialing found numbers.

---

## Tech + operations

- **Stack**: Next.js 14 App Router · TypeScript · Tailwind · deployed
  on Vercel.
- **Real integrations shipped**: libphonenumber carrier prefix data,
  phone / email validation, Gravatar.
- **Stubbed for now**: Stripe (payment buttons are visual), auth,
  people-search provider, cancellation portal, email delivery on
  Stage-3 capture.
- **Cost per lookup today**: $0 (all Phase-1 sources are free).
- **Cost per lookup at Phase 3**: ~$0.10-0.50 (data provider) + a few
  cents for HIBP / DeHashed / Twilio if we hit them for that query.

---

## Stage

Pre-launch. Fully animated funnel + real metadata + free-tier
enrichment building right now. No paying users yet, no marketing
spend, no permanent brand name chosen (working name "Searcher").

---

## Next 90 days

1. Pick a permanent brand name + `.com` domain, register.
2. Wire real Stripe subscriptions ($1 → $29.99 / 28d).
3. Ship auth (email + Google OAuth).
4. Sign with Endato or PeopleDataLabs, wire into `/api/search/*`.
5. Cancellation portal (FTC compliance).
6. Analytics (PostHog / GA4) with funnel events per stage.
7. First paid acquisition test — $500-1000 on Facebook / TikTok
   targeting the "who is texting my partner" search intent.

---

## Team

Solo founder — moisesbenchoc@gmail.com. Previously ran the original
ClarityCheck; rebuilding after loss of access to the source code.
