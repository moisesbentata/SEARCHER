import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { FunnelStage } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  stage: z.enum([
    "LANDING",
    "SEARCH",
    "RESULTS_LOAD",
    "STAGE_OWNER",
    "STAGE_EMAIL",
    "LEAD_SUBMIT",
    "STAGE_PAYMENT",
    "PAY_CLICK",
    "PAID",
  ]),
  sessionId: z.string().max(64).optional(),
  email: z.string().max(254).optional(),
  path: z.string().max(512).optional(),
  kind: z.string().max(32).optional(),
});

/**
 * Private funnel-event ingest. Fire-and-forget from the client; we always
 * return `{ ok: true }` even on bad bodies so the client's keepalive beacon
 * never surfaces an error that leaks into user-visible state.
 */
export async function POST(req: NextRequest) {
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: true });
  }
  try {
    await prisma.funnelEvent.create({
      data: {
        stage: parsed.stage as FunnelStage,
        sessionId: parsed.sessionId ?? null,
        email: parsed.email ?? null,
        path: parsed.path ?? null,
        kind: parsed.kind ?? null,
      },
    });
  } catch (err) {
    console.warn("[analytics:log] insert failed", err);
  }
  return NextResponse.json({ ok: true });
}
