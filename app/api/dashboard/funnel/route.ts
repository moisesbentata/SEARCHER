import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { FunnelStage } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RANGES: Record<string, number | null> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  all: null,
};

type Row = { stage: FunnelStage; count: number };

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!isAdminEmail(session?.account?.email)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const range = req.nextUrl.searchParams.get("range") ?? "7d";
  const ms = range in RANGES ? RANGES[range] : RANGES["7d"];
  const since = ms ? new Date(Date.now() - ms) : null;

  // One query per stage, counting distinct sessionIds (so multiple
  // events in a single visit don't inflate the funnel). Fallback to
  // total row count for events with no sessionId.
  const stages: FunnelStage[] = [
    "LANDING",
    "SEARCH",
    "RESULTS_LOAD",
    "STAGE_OWNER",
    "STAGE_EMAIL",
    "LEAD_SUBMIT",
    "STAGE_PAYMENT",
    "PAY_CLICK",
    "PAID",
  ];

  const rows: Row[] = await Promise.all(
    stages.map(async (stage) => {
      const where = since
        ? { stage, createdAt: { gte: since } }
        : { stage };
      const [withSession, totalRows] = await Promise.all([
        prisma.funnelEvent.findMany({
          where: { ...where, sessionId: { not: null } },
          distinct: ["sessionId"],
          select: { sessionId: true },
        }),
        prisma.funnelEvent.count({ where }),
      ]);
      const sessionless = Math.max(0, totalRows - withSession.length);
      return { stage, count: withSession.length + sessionless };
    }),
  );

  return NextResponse.json({
    ok: true,
    range,
    since: since?.toISOString() ?? null,
    now: new Date().toISOString(),
    rows,
  });
}
