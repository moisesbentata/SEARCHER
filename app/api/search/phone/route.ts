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

  // If we got a valid E.164 number, ask the carrier module (which will use
  // NumVerify or AbstractAPI if configured, else fall back to a country hint).
  if (result.valid && result.e164) {
    const carrier = await lookupCarrier(result.e164, result.countryCode);
    result.carrier = carrier.carrier;
    result.carrierSource = carrier.source;
    // If the external API returned a more specific line type, prefer it
    if (carrier.lineType && !result.type) {
      result.type = carrier.lineType.toUpperCase();
    }
  }

  return NextResponse.json(result);
}
