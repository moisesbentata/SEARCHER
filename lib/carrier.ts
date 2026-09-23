// Real carrier lookup for a phone number.
//
// libphonenumber-js gives us the LINE TYPE (mobile / fixed / VoIP / …) from
// the prefix alone. Carrier — the actual network operator (Verizon, EE,
// Movistar, …) — cannot be derived from the number by client-side data:
// number-portability means the prefix's original owner is often not the
// current one, so a real answer needs an external HLR/HLR-lite lookup.
//
// This module wraps two options:
//   1) NumVerify (apilayer): free tier 100 lookups/month, cheap to enable.
//      Set NUMVERIFY_API_KEY in the environment.
//   2) Abstract API: same shape, alternative provider. Set
//      ABSTRACTAPI_PHONE_KEY. Used only if NumVerify isn't configured.
//
// When neither key is set we fall back to a light per-country hint table.
// Every call is side-effect-free and safe to run server-side only (never
// expose the key to the client).

export type CarrierResult = {
  carrier?: string;
  lineType?: string; // "mobile" | "landline" | "special_services" | "voip"…
  source: "numverify" | "abstractapi" | "prefix-table" | "unknown";
};

const NUMVERIFY_URL = "http://apilayer.net/api/validate";
const ABSTRACT_URL = "https://phonevalidation.abstractapi.com/v1/";

async function fetchJson(url: string, timeoutMs = 3500): Promise<unknown | null> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function viaNumVerify(e164: string): Promise<CarrierResult | null> {
  const key = process.env.NUMVERIFY_API_KEY;
  if (!key) return null;
  const number = encodeURIComponent(e164.replace(/^\+/, ""));
  const url = `${NUMVERIFY_URL}?access_key=${encodeURIComponent(key)}&number=${number}&format=1`;
  const j = (await fetchJson(url)) as
    | { valid?: boolean; carrier?: string; line_type?: string }
    | null;
  if (!j || j.valid === false) return null;
  return {
    carrier: j.carrier || undefined,
    lineType: j.line_type || undefined,
    source: "numverify",
  };
}

async function viaAbstract(e164: string): Promise<CarrierResult | null> {
  const key = process.env.ABSTRACTAPI_PHONE_KEY;
  if (!key) return null;
  const url = `${ABSTRACT_URL}?api_key=${encodeURIComponent(key)}&phone=${encodeURIComponent(e164)}`;
  const j = (await fetchJson(url)) as
    | { valid?: boolean; carrier?: string; line_type?: string }
    | null;
  if (!j || j.valid === false) return null;
  return {
    carrier: j.carrier || undefined,
    lineType: j.line_type || undefined,
    source: "abstractapi",
  };
}

// Rough per-country "who owns the most numbers here" hint. Used only when no
// API key is configured; not authoritative and never used to make claims
// about a specific subscriber.
const COUNTRY_CARRIER_HINT: Record<string, string> = {
  US: "Verizon Wireless / AT&T / T-Mobile (major US network)",
  CA: "Bell / Rogers / Telus (major Canadian network)",
  GB: "EE / O2 / Vodafone / Three (major UK network)",
  ES: "Movistar / Vodafone / Orange (major Spanish network)",
  FR: "Orange / SFR / Bouygues / Free (major French network)",
  DE: "Deutsche Telekom / Vodafone / O2 (major German network)",
  IT: "TIM / Vodafone / WindTre / Iliad (major Italian network)",
  NL: "KPN / VodafoneZiggo / T-Mobile NL (major Dutch network)",
  BE: "Proximus / Orange BE / Base (major Belgian network)",
  PT: "MEO / NOS / Vodafone PT (major Portuguese network)",
  BR: "Vivo / Claro / TIM / Oi (major Brazilian network)",
  MX: "Telcel / AT&T México / Movistar (major Mexican network)",
  AR: "Personal / Movistar / Claro (major Argentine network)",
  AU: "Telstra / Optus / Vodafone AU (major Australian network)",
  IL: "Cellcom / Partner / Pelephone (major Israeli network)",
  IN: "Airtel / Jio / Vi (major Indian network)",
  JP: "NTT Docomo / au / SoftBank (major Japanese network)",
  KR: "SK Telecom / KT / LG U+ (major Korean network)",
  CN: "China Mobile / China Unicom / China Telecom (major Chinese network)",
  ZA: "Vodacom / MTN / Cell C (major South African network)",
  TR: "Turkcell / Vodafone TR / Türk Telekom (major Turkish network)",
};

// Called by the server /api/search/phone route. Given an E.164 number and its
// country, best-effort return a real carrier name.
export async function lookupCarrier(
  e164: string,
  countryCode?: string,
): Promise<CarrierResult> {
  // Prefer real providers when configured
  const providers: Array<() => Promise<CarrierResult | null>> = [
    () => viaNumVerify(e164),
    () => viaAbstract(e164),
  ];
  for (const p of providers) {
    const r = await p();
    if (r && r.carrier) return r;
    if (r && r.lineType) return r; // returned but no carrier — still useful
  }

  // Fallback: generic country-level hint
  if (countryCode && COUNTRY_CARRIER_HINT[countryCode]) {
    return {
      carrier: COUNTRY_CARRIER_HINT[countryCode],
      source: "prefix-table",
    };
  }

  return { source: "unknown" };
}
