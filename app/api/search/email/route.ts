import { NextRequest, NextResponse } from "next/server";
import { lookupEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { email?: string };
  const email = (body.email ?? "").toString();

  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const result = await lookupEmail(email);

  // Optional breach lookup via HaveIBeenPwned. Requires an API key
  // (HIBP_API_KEY). Skipped silently when not configured or when the request
  // fails, so the response never blocks on it.
  if (result.valid && process.env.HIBP_API_KEY) {
    try {
      const resp = await fetch(
        `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(result.normalized!)}?truncateResponse=true`,
        {
          headers: {
            "hibp-api-key": process.env.HIBP_API_KEY,
            "user-agent": "searcher-lookup/0.1",
          },
          cache: "no-store",
        },
      );
      if (resp.ok) {
        const breaches = (await resp.json()) as Array<{ Name: string }>;
        result.breachCount = breaches.length;
      } else if (resp.status === 404) {
        result.breachCount = 0;
      }
    } catch {
      // ignore
    }
  }

  return NextResponse.json(result);
}
