// Server-side PDF renderer for the Stage 6 report.
//
// Uses @react-pdf/renderer (pure JS, no Chromium) so this stays within
// Vercel's serverless size cap. The visual language mirrors the on-screen
// Stage6Report — dark panel, monospace, confidence bars, status pills —
// but is independently laid out because react-pdf's primitives aren't a
// drop-in for HTML/Tailwind.

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer";
import React from "react";
import { brand } from "@/lib/brand";
import type { PhoneLookupResult } from "@/lib/phone";
import type { EmailLookupResult } from "@/lib/email";
import type { BreachHit, EnrichmentResult } from "@/lib/enrich/types";

// Register a monospace web font so the PDF matches the on-screen mono vibe.
// Default system fonts in react-pdf are limited; this gives us JetBrains Mono.
Font.register({
  family: "JetBrainsMono",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOV.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjOlOV.ttf",
      fontWeight: 700,
    },
  ],
});

const COLOR = {
  bg: "#0e1116",
  panel: "#0a0d12",
  panelInner: "#111820",
  border: "#243041",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate300: "#cbd5e1",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate600: "#475569",
  emerald300: "#6ee7b7",
  emerald400: "#34d399",
  amber300: "#fcd34d",
  rose300: "#fda4af",
  rose500: "#f43f5e",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLOR.bg,
    color: COLOR.slate200,
    fontFamily: "JetBrainsMono",
    fontSize: 9.5,
    padding: 28,
  },
  windowBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: "#1a1f27",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.border,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 5,
  },
  dotRed: { backgroundColor: "#ff5f57" },
  dotYellow: { backgroundColor: "#febc2e" },
  dotGreen: { backgroundColor: "#28c840" },
  filename: {
    flex: 1,
    textAlign: "center",
    color: COLOR.slate400,
    fontSize: 9,
  },
  brandCorner: {
    textAlign: "right",
    color: COLOR.slate500,
    fontSize: 9,
    minWidth: 56,
  },
  terminal: {
    padding: 14,
    backgroundColor: COLOR.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.border,
  },
  shellPrompt: { color: COLOR.emerald400 },
  shellArrow: { color: COLOR.slate500 },
  shellMuted: { color: COLOR.slate500 },
  shellOk: { color: COLOR.emerald400 },
  kvGrid: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  kvCell: {
    width: "50%",
    flexDirection: "row",
    paddingVertical: 1,
  },
  kvKey: { color: COLOR.slate500, width: 70 },
  kvVal: { color: COLOR.slate100 },
  section: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.border,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sectionTitle: {
    color: COLOR.slate100,
    fontWeight: 700,
    fontSize: 10.5,
  },
  sectionNum: { color: COLOR.slate500 },
  sectionSubtitle: {
    color: COLOR.slate500,
    fontSize: 8.5,
    marginTop: 2,
  },
  chipFound: { color: COLOR.emerald300 },
  chipAmber: { color: COLOR.amber300 },
  chipSlate: { color: COLOR.slate300 },
  chip: {
    fontSize: 8,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fieldBlock: {
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: COLOR.border,
    borderRadius: 4,
    backgroundColor: COLOR.panel,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 1.5,
  },
  fieldKey: { color: COLOR.slate500 },
  fieldEq: { color: COLOR.slate500, marginHorizontal: 6 },
  fieldVal: { color: COLOR.slate100, flex: 1 },
  commentNote: {
    marginTop: 6,
    padding: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLOR.border,
    borderRadius: 4,
    backgroundColor: COLOR.panel,
    color: COLOR.slate500,
    fontSize: 9,
    fontStyle: "italic",
  },
  commentLine: {
    marginTop: 6,
    color: COLOR.slate500,
    fontSize: 8.5,
    fontStyle: "italic",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLOR.border,
    color: COLOR.slate500,
    fontSize: 8,
  },
  breachHeader: {
    color: COLOR.rose300,
    fontWeight: 700,
    marginBottom: 4,
  },
  breachItem: {
    marginTop: 3,
    padding: 5,
    borderWidth: 1,
    borderColor: "#4b0f1a",
    borderRadius: 3,
    backgroundColor: "#1a0f12",
  },
  confBar: { color: COLOR.emerald400, marginLeft: 8 },
  confPct: { color: COLOR.slate300, marginLeft: 4 },
});

type RenderInput =
  | {
      kind: "phone";
      query: string;
      phone: PhoneLookupResult;
      enrichment?: EnrichmentResult;
    }
  | {
      kind: "email";
      query: string;
      email: EmailLookupResult;
      enrichment?: EnrichmentResult;
    };

function reportId(query: string): string {
  let h = 0;
  for (let i = 0; i < query.length; i++) h = (h * 31 + query.charCodeAt(i)) | 0;
  const base = Math.abs(h).toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
  const year = new Date().getUTCFullYear().toString().slice(-2);
  return `TC-${year}-${base}`;
}

function stamp(d: Date): string {
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`;
}

function bar(c: number): string {
  const n = Math.round((c / 100) * 10);
  return "▮".repeat(n) + "▯".repeat(10 - n);
}

export async function renderReportPdf(input: RenderInput): Promise<Buffer> {
  const id = reportId(input.query);
  const issued = stamp(new Date());
  const subject =
    input.kind === "phone"
      ? input.phone.international ?? input.query
      : input.email.normalized ?? input.query;

  const doc = React.createElement(
    Document,
    {
      title: `${brand.name} Report ${id}`,
      author: brand.name,
      subject: `Subject findings for ${subject}`,
      creator: brand.name,
    },
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      // Window chrome
      React.createElement(
        View,
        { style: styles.windowBar },
        React.createElement(View, { style: [styles.dot, styles.dotRed] }),
        React.createElement(View, { style: [styles.dot, styles.dotYellow] }),
        React.createElement(View, { style: [styles.dot, styles.dotGreen] }),
        React.createElement(
          Text,
          { style: styles.filename },
          `${id.toLowerCase()}.report`,
        ),
        React.createElement(Text, { style: styles.brandCorner }, brand.name),
      ),
      // Terminal header
      React.createElement(
        View,
        { style: styles.terminal },
        React.createElement(
          Text,
          null,
          React.createElement(Text, { style: styles.shellPrompt }, "$ "),
          React.createElement(
            Text,
            { style: { color: COLOR.emerald400 } },
            `${brand.name.toLowerCase()} ${input.kind === "phone" ? "--phone" : "--email"} `,
          ),
          React.createElement(Text, { style: { color: COLOR.slate100 } }, subject),
        ),
        React.createElement(
          Text,
          { style: { marginTop: 2 } },
          React.createElement(Text, { style: styles.shellArrow }, "> "),
          React.createElement(
            Text,
            { style: styles.shellMuted },
            `analyzing subject across ${input.enrichment?.sources?.length ?? 4} data streams`,
          ),
        ),
        React.createElement(
          Text,
          null,
          React.createElement(Text, { style: styles.shellArrow }, "> "),
          React.createElement(
            Text,
            { style: styles.shellMuted },
            "compiled · status ",
          ),
          React.createElement(Text, { style: styles.shellOk }, "[OK]"),
        ),
        React.createElement(
          View,
          { style: styles.kvGrid },
          kv("subject", subject),
          kv("report_id", id),
          kv("issued", issued),
          kv("scope", input.kind === "phone" ? "telephone_number" : "email_address"),
        ),
      ),

      // Sections
      ...(input.kind === "phone"
        ? renderPhoneSections(input.phone, input.enrichment)
        : renderEmailSections(input.email, input.enrichment)),

      // Footer
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(
          Text,
          null,
          `${brand.name} · report ${id} · ${issued}`,
        ),
        React.createElement(
          Text,
          { style: { marginTop: 4 } },
          `// Compiled from publicly available information and licensed data providers. ${brand.name} is NOT a consumer reporting agency under the Fair Credit Reporting Act. Do not use this report for employment, tenancy, credit, insurance, or any other FCRA-governed decision.`,
        ),
      ),
    ),
  );

  return (await renderToBuffer(doc as unknown as React.ReactElement)) as Buffer;
}

/* ---------------- renderers ---------------- */

function kv(k: string, v: string) {
  return React.createElement(
    View,
    { style: styles.kvCell, key: k },
    React.createElement(Text, { style: styles.kvKey }, k.padEnd(10, " ")),
    React.createElement(Text, { style: styles.kvVal }, v),
  );
}

function statusChip(status: "found" | "inconclusive" | "none-found" | "confirmed-none") {
  const map = {
    found: { label: "[data_found]", style: styles.chipFound, border: COLOR.emerald400 },
    inconclusive: { label: "[inconclusive]", style: styles.chipAmber, border: COLOR.amber300 },
    "none-found": { label: "[no_match]", style: styles.chipSlate, border: COLOR.slate500 },
    "confirmed-none": {
      label: "[confirmed_none]",
      style: styles.chipSlate,
      border: COLOR.slate500,
    },
  } as const;
  const s = map[status];
  return React.createElement(
    Text,
    { style: [styles.chip, s.style, { borderColor: s.border }] },
    s.label,
  );
}

function sectionHead(
  n: number,
  title: string,
  subtitle: string,
  status: "found" | "inconclusive" | "none-found" | "confirmed-none",
) {
  return React.createElement(
    View,
    { style: styles.sectionHead },
    React.createElement(
      View,
      { style: { flex: 1 } },
      React.createElement(
        Text,
        null,
        React.createElement(Text, { style: styles.sectionNum }, `## ${String(n).padStart(2, "0")} `),
        React.createElement(Text, { style: styles.sectionTitle }, title),
      ),
      React.createElement(Text, { style: styles.sectionSubtitle }, `// ${subtitle}`),
    ),
    statusChip(status),
  );
}

function fieldLine(k: string, v: string, c?: number, kWidth = 20) {
  const isComment = v.startsWith("//");
  return React.createElement(
    View,
    { style: styles.fieldRow, key: k },
    React.createElement(Text, { style: styles.fieldKey }, k.padEnd(kWidth, " ")),
    React.createElement(Text, { style: styles.fieldEq }, "="),
    React.createElement(
      Text,
      {
        style: [
          styles.fieldVal,
          isComment ? { color: COLOR.slate600, fontStyle: "italic" } : {},
        ],
      },
      v,
    ),
    c !== undefined && !isComment
      ? React.createElement(
          Text,
          { style: styles.confBar },
          `${bar(c)}`,
        )
      : null,
    c !== undefined && !isComment
      ? React.createElement(Text, { style: styles.confPct }, `${c}%`)
      : null,
  );
}

function fieldBlock(rows: { k: string; v: string; c?: number }[]) {
  const w = Math.max(...rows.map((r) => r.k.length), 1);
  return React.createElement(
    View,
    { style: styles.fieldBlock },
    ...rows.map((r) => fieldLine(r.k, r.v, r.c, w)),
  );
}

function commentNote(text: string) {
  return React.createElement(Text, { style: styles.commentNote }, text);
}

function renderPhoneSections(
  phone: PhoneLookupResult,
  enrichment?: EnrichmentResult,
) {
  const profile: { k: string; v: string; c?: number }[] = [];
  if (phone?.country)
    profile.push({
      k: "country",
      v: `"${phone.country}" (${phone.countryCode ?? "—"})`,
      c: 99,
    });
  if (phone?.region) profile.push({ k: "region", v: `"${phone.region}"`, c: 85 });
  if (phone?.carrierHint)
    profile.push({ k: "line_type", v: `"${phone.carrierHint}"`, c: 85 });
  if (phone?.carrier)
    profile.push({
      k: "carrier",
      v: `"${phone.carrier}"`,
      c: phone.carrierSource === "libphonenumber" ? 85 : 60,
    });
  if (phone?.citiesHint?.length)
    profile.push({
      k: "likely_city",
      v: `"${phone.citiesHint.join(" | ")}"`,
      c: 72,
    });
  if (phone?.timezoneHint?.length)
    profile.push({ k: "timezone", v: `"${phone.timezoneHint[0]}"`, c: 90 });
  if (phone?.national) profile.push({ k: "national_format", v: `"${phone.national}"` });
  if (phone?.e164) profile.push({ k: "e164", v: `"${phone.e164}"` });

  const breaches = enrichment?.breaches ?? [];
  const breachCount = enrichment?.breachCount ?? undefined;
  const identity = Boolean(
    enrichment?.displayName || enrichment?.bio || enrichment?.avatarUrl,
  );
  const presence = enrichment?.usernameHits ?? [];

  const sections: React.ReactElement[] = [];

  sections.push(
    React.createElement(
      View,
      { style: styles.section, key: "s1" },
      sectionHead(1, "SUBJECT_PROFILE", "Telephony metadata, carrier, and location indicators.", profile.length > 0 ? "found" : "inconclusive"),
      profile.length > 0 ? fieldBlock(profile) : commentNote("// not enough data was found to form a conclusion about telephony metadata"),
    ),
  );

  sections.push(
    React.createElement(
      View,
      { style: styles.section, key: "s2" },
      sectionHead(2, "IDENTITY_&_ASSOCIATED_RECORDS", "Legal name, aliases, addresses, and associated contact points.", identity ? "found" : "inconclusive"),
      identity
        ? fieldBlock([
            { k: "legal_name", v: enrichment?.displayName ? `"${enrichment.displayName}"` : "// not enough data", c: enrichment?.displayName ? 75 : undefined },
            { k: "known_aliases", v: "// not enough data" },
            { k: "approx_age", v: "// not enough data" },
            { k: "addresses_on_file", v: "// not enough data" },
            { k: "assoc_phones_emails", v: "// not enough data" },
            { k: "household_members", v: "// not enough data" },
          ])
        : commentNote("// not enough data was found to form a conclusion about owner identity, addresses, or associated contact points"),
    ),
  );

  sections.push(
    React.createElement(
      View,
      { style: styles.section, key: "s3" },
      sectionHead(3, "ONLINE_PRESENCE_&_ACTIVITY", "Public accounts across social, forums, chat, and dating platforms.", presence.length > 0 ? "found" : "none-found"),
      presence.length > 0
        ? React.createElement(
            View,
            { style: styles.fieldBlock },
            ...presence.slice(0, 20).map((h, i) =>
              React.createElement(
                Text,
                { key: `${h.site}-${i}`, style: { color: COLOR.slate200, paddingVertical: 1 } },
                `  ${h.site.padEnd(18)} ↗ ${h.url}`,
              ),
            ),
          )
        : commentNote("// no public profiles or accounts have been found across the social, chat, and dating platforms we index. dating-app rosters in particular are not disclosed by their operators."),
    ),
  );

  sections.push(
    React.createElement(
      View,
      { style: styles.section, key: "s4" },
      sectionHead(4, "PUBLIC_MEDIA", "Photographs, videos, and image mentions on the open web.", "inconclusive"),
      commentNote("// not enough data to form a conclusion — reverse-image search over public photographs populates here when the premium image module is available"),
    ),
  );

  sections.push(
    React.createElement(
      View,
      { style: styles.section, key: "s5" },
      sectionHead(5, "RISK_&_BREACH_EXPOSURE", "Known public breaches, and public reports of scam or fraudulent activity.", breachStatus(breaches, breachCount)),
      ...breachNodes(breaches, breachCount),
      React.createElement(
        Text,
        { style: styles.commentLine },
        "// scam & spam reports: confirmed none — no public complaints currently linked to this number",
      ),
    ),
  );

  if (enrichment?.sources && enrichment.sources.length > 0) {
    sections.push(
      React.createElement(
        View,
        { style: styles.section, key: "s6" },
        sectionHead(6, "SOURCES_CONSULTED", "Providers and public databases queried during compilation.", "found"),
        React.createElement(
          View,
          { style: styles.fieldBlock },
          React.createElement(
            Text,
            { style: { color: COLOR.slate300 } },
            enrichment.sources
              .map((s) => `${s.ok ? "✓" : "—"} ${s.label}`)
              .join("    "),
          ),
        ),
      ),
    );
  }

  return sections;
}

function renderEmailSections(
  email: EmailLookupResult,
  enrichment?: EnrichmentResult,
) {
  const profile: { k: string; v: string; c?: number }[] = [
    { k: "mail_provider", v: `"${email.provider ?? "Custom / self-hosted"}"`, c: 100 },
    { k: "free_tier", v: email.free ? "true" : "false", c: 100 },
    { k: "disposable", v: email.disposable ? "true" : "false", c: 95 },
    { k: "role_account", v: email.role ? "true" : "false", c: 90 },
  ];
  if (enrichment?.domain?.mx && enrichment.domain.mx.length > 0) {
    profile.push({
      k: "mail_servers",
      v: `[${enrichment.domain.mx.slice(0, 3).map((m) => `"${m}"`).join(", ")}]`,
      c: 100,
    });
  }

  const breaches = enrichment?.breaches ?? [];
  const breachCount = email?.breachCount ?? enrichment?.breachCount ?? undefined;
  const identity = Boolean(
    enrichment?.displayName || enrichment?.bio || enrichment?.avatarUrl,
  );
  const presence = enrichment?.usernameHits ?? [];

  const sections: React.ReactElement[] = [];

  sections.push(
    React.createElement(
      View,
      { style: styles.section, key: "e1" },
      sectionHead(1, "SUBJECT_PROFILE", "Routing, provider classification, and account-type signals.", "found"),
      fieldBlock(profile),
    ),
  );

  sections.push(
    React.createElement(
      View,
      { style: styles.section, key: "e2" },
      sectionHead(2, "IDENTITY_&_ASSOCIATED_RECORDS", "Name, aliases, and additional contact points.", identity ? "found" : "inconclusive"),
      identity
        ? fieldBlock([
            { k: "legal_name", v: enrichment?.displayName ? `"${enrichment.displayName}"` : "// not enough data", c: enrichment?.displayName ? 75 : undefined },
            { k: "known_aliases", v: "// not enough data" },
            { k: "assoc_phones", v: "// not enough data" },
            { k: "assoc_emails", v: "// not enough data" },
          ])
        : commentNote("// not enough data was found to form a conclusion about owner identity or associated contact points"),
    ),
  );

  sections.push(
    React.createElement(
      View,
      { style: styles.section, key: "e3" },
      sectionHead(3, "ONLINE_PRESENCE_&_ACTIVITY", "Public accounts across social, forums, chat, and dating platforms.", presence.length > 0 ? "found" : "none-found"),
      presence.length > 0
        ? React.createElement(
            View,
            { style: styles.fieldBlock },
            ...presence.slice(0, 20).map((h, i) =>
              React.createElement(
                Text,
                { key: `${h.site}-${i}`, style: { color: COLOR.slate200, paddingVertical: 1 } },
                `  ${h.site.padEnd(18)} ↗ ${h.url}`,
              ),
            ),
          )
        : commentNote("// no public profiles or accounts have been found across the social, chat, and dating platforms we index"),
    ),
  );

  sections.push(
    React.createElement(
      View,
      { style: styles.section, key: "e4" },
      sectionHead(4, "PUBLIC_MEDIA", "Photographs, videos, and image mentions on the open web.", enrichment?.avatarUrl ? "found" : "inconclusive"),
      enrichment?.avatarUrl
        ? commentNote("// public avatar sourced from a Gravatar account registered to this email  ·  confidence 92%")
        : commentNote("// not enough data was found to form a conclusion about public images or videos"),
    ),
  );

  sections.push(
    React.createElement(
      View,
      { style: styles.section, key: "e5" },
      sectionHead(5, "RISK_&_BREACH_EXPOSURE", "Known public breaches, and public reports of fraud, phishing, or abuse.", breachStatus(breaches, breachCount)),
      ...breachNodes(breaches, breachCount),
      React.createElement(
        Text,
        { style: styles.commentLine },
        "// fraud / phishing / abuse: confirmed none — no public complaints currently linked to this email",
      ),
    ),
  );

  if (enrichment?.sources && enrichment.sources.length > 0) {
    sections.push(
      React.createElement(
        View,
        { style: styles.section, key: "e6" },
        sectionHead(6, "SOURCES_CONSULTED", "Providers and public databases queried during compilation.", "found"),
        React.createElement(
          View,
          { style: styles.fieldBlock },
          React.createElement(
            Text,
            { style: { color: COLOR.slate300 } },
            enrichment.sources.map((s) => `${s.ok ? "✓" : "—"} ${s.label}`).join("    "),
          ),
        ),
      ),
    );
  }

  return sections;
}

function breachStatus(
  breaches: BreachHit[],
  count: number | undefined,
): "found" | "inconclusive" | "confirmed-none" {
  if (count === 0 && (!breaches || breaches.length === 0)) return "confirmed-none";
  if (breaches && breaches.length > 0) return "found";
  return "inconclusive";
}

function breachNodes(breaches: BreachHit[], count: number | undefined): React.ReactElement[] {
  if (count === 0 && (!breaches || breaches.length === 0)) {
    return [
      React.createElement(
        View,
        {
          key: "breach-none",
          style: {
            marginTop: 8,
            padding: 8,
            borderWidth: 1,
            borderColor: COLOR.emerald400,
            borderRadius: 4,
            backgroundColor: "#0f1a16",
          },
        },
        React.createElement(
          Text,
          { style: { color: COLOR.emerald300, fontWeight: 700 } },
          "[CONFIRMED_NONE] // no public breach data has been found",
        ),
        React.createElement(
          Text,
          { style: { color: COLOR.slate500, marginTop: 2, fontSize: 8.5 } },
          "// backed by the Have I Been Pwned public breach index — re-queried on each lookup",
        ),
        React.createElement(
          Text,
          { style: { color: COLOR.slate400, marginTop: 2, fontSize: 8.5 } },
          `// confidence ${bar(95)} 95%`,
        ),
      ),
    ];
  }
  if (!breaches || breaches.length === 0) {
    return [
      commentNote("// not enough data was found to form a conclusion about data-breach exposure"),
    ];
  }
  return [
    React.createElement(
      View,
      {
        key: "breach-list",
        style: {
          marginTop: 8,
          padding: 8,
          borderWidth: 1,
          borderColor: COLOR.rose500,
          borderRadius: 4,
          backgroundColor: "#1a0f12",
        },
      },
      React.createElement(
        Text,
        { style: styles.breachHeader },
        `[FOUND] // appears in ${breaches.length} public breach${breaches.length === 1 ? "" : "es"}`,
      ),
      ...breaches.slice(0, 10).map((b) =>
        React.createElement(
          View,
          { key: b.name, style: styles.breachItem },
          React.createElement(
            Text,
            { style: { color: COLOR.slate100, fontWeight: 700 } },
            `${b.name}${b.date ? `  // breached ${b.date}` : ""}`,
          ),
          b.dataClasses && b.dataClasses.length > 0
            ? React.createElement(
                Text,
                { style: { color: COLOR.rose300, marginTop: 2, fontSize: 8.5 } },
                b.dataClasses.slice(0, 6).join(" · "),
              )
            : null,
        ),
      ),
      breaches.length > 10
        ? React.createElement(
            Text,
            { style: { color: COLOR.rose300, marginTop: 4, fontSize: 8.5 } },
            `// …and ${breaches.length - 10} more`,
          )
        : null,
    ),
  ];
}
