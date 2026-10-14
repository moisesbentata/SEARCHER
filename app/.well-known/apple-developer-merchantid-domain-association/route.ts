// Apple Pay domain verification endpoint. Stripe gives a text blob when
// you add a domain in Dashboard → Settings → Payment methods → Apple Pay.
// Paste it into env var APPLE_PAY_DOMAIN_ASSOCIATION (Vercel Secret) and
// Apple will fetch this URL to verify ownership.

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  const body = process.env.APPLE_PAY_DOMAIN_ASSOCIATION ?? "";
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
