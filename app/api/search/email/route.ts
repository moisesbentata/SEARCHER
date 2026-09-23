import { NextRequest, NextResponse } from "next/server";
import { lookupEmail } from "@/lib/email";
import { enrichEmail } from "@/lib/enrich";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { email?: string };
  const email = (body.email ?? "").toString();

  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const result = await lookupEmail(email);

  if (result.valid && result.normalized) {
    result.enrichment = await enrichEmail(result.normalized);
    if (result.enrichment.breachCount !== undefined) {
      result.breachCount = result.enrichment.breachCount;
    }
  }

  return NextResponse.json(result);
}
