import { NextRequest, NextResponse } from "next/server";
import { lookupPhone } from "@/lib/phone";
import { lookupCarrier } from "@/lib/carrier";
import type { CountryCode } from "libphonenumber-js";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    phone?: string;
    defaultCountry?: string;
  };
  const phone = (body.phone ?? "").toString();
  const defaultCountry = (body.defaultCountry ?? "").toString().toUpperCase();

  if (!phone) {
    return NextResponse.json({ error: "phone required" }, { status: 400 });
  }

  const result = lookupPhone(
    phone,
    (defaultCountry || undefined) as CountryCode | undefined,
  );

  // Resolve carrier locally from Google's bundled carrier prefix data.
  // Free at scale, no network call, no key.
  if (result.valid && result.e164) {
    const carrier = lookupCarrier(result.e164, result.countryCode);
    result.carrier = carrier.carrier;
    result.carrierSource = carrier.source;
  }

  return NextResponse.json(result);
}
