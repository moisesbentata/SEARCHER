import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import nodemailer from "nodemailer";
import { brand } from "@/lib/brand";
import { isValidEmail, normalizeEmail } from "@/lib/auth";
import { hitRateLimit } from "@/lib/ratelimit";
import { getClientIp } from "@/lib/request-meta";
import { lookupPhone } from "@/lib/phone";
import { lookupEmail } from "@/lib/email";
import { renderReportPdf } from "@/lib/pdf/renderReport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const Body = z.object({
  email: z.string().min(3).max(254),
  subject: z.string().min(1).max(254),
  kind: z.enum(["phone", "email"]),
});

export async function POST(req: NextRequest) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    return NextResponse.json(
      { ok: false, message: "Email sending isn't configured yet." },
      { status: 500 },
    );
  }

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request." },
      { status: 400 },
    );
  }

  if (!isValidEmail(parsed.email)) {
    return NextResponse.json(
      { ok: false, message: "That doesn't look like a valid email." },
      { status: 400 },
    );
  }
  const recipient = normalizeEmail(parsed.email);

  // Rate limits: at most 3 PDF sends per email per hour, 15 per IP per hour.
  const ip = getClientIp(req);
  const hour = 60 * 60 * 1000;
  const perEmail = await hitRateLimit({
    key: `pdf:email:${recipient}`,
    max: 3,
    windowMs: hour,
  });
  if (!perEmail.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many report emails to this address in the last hour. Try again later." },
      { status: 429 },
    );
  }
  if (ip) {
    const perIp = await hitRateLimit({
      key: `pdf:ip:${ip}`,
      max: 15,
      windowMs: hour,
    });
    if (!perIp.allowed) {
      return NextResponse.json(
        { ok: false, message: "Too many requests from this network. Try again later." },
        { status: 429 },
      );
    }
  }

  // Rebuild the same lookup data the UI compiled. The server-side report is
  // generated fresh from the subject value — the client never ships raw
  // records to us.
  let pdfBuffer: Buffer;
  try {
    if (parsed.kind === "phone") {
      const phone = lookupPhone(parsed.subject);
      if (!phone.valid) {
        return NextResponse.json(
          { ok: false, message: "Couldn't resolve the phone number." },
          { status: 400 },
        );
      }
      pdfBuffer = await renderReportPdf({
        kind: "phone",
        query: parsed.subject,
        phone,
        enrichment: phone.enrichment,
      });
    } else {
      const email = await lookupEmail(parsed.subject);
      if (!email.valid) {
        return NextResponse.json(
          { ok: false, message: "Couldn't resolve the email address." },
          { status: 400 },
        );
      }
      pdfBuffer = await renderReportPdf({
        kind: "email",
        query: parsed.subject,
        email,
        enrichment: email.enrichment,
      });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, message: `Failed to compile the PDF: ${msg}` },
      { status: 500 },
    );
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  const subjectDisplay = parsed.subject;
  const filename = `${brand.name.toLowerCase()}-report-${Date.now()}.pdf`;

  try {
    await transporter.sendMail({
      from: `"${brand.name}" <${user}>`,
      to: recipient,
      subject: `${brand.name} report for ${subjectDisplay}`,
      text:
        `Your ${brand.name} report for ${subjectDisplay} is attached as a PDF.\n\n` +
        `This report was compiled from publicly available information and licensed data providers. ` +
        `${brand.name} is not a consumer reporting agency under the Fair Credit Reporting Act — do not use this report for employment, tenancy, credit, insurance, or any other FCRA-governed decision.\n\n` +
        `${brand.name} · ${brand.domain}`,
      html: htmlEmailBody(subjectDisplay),
      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, message: `Couldn't deliver the email: ${msg}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

function htmlEmailBody(subject: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#101828;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #eef0f4;">
      <tr>
        <td style="padding:28px;">
          <div style="font-size:12px;letter-spacing:0.1em;color:#64748b;text-transform:uppercase;">${brand.name}</div>
          <h1 style="margin:8px 0 16px 0;font-size:20px;color:#101828;">Your report is attached</h1>
          <p style="margin:0 0 12px 0;font-size:14px;line-height:1.55;color:#475467;">
            The ${brand.name} report for <strong>${subject}</strong> is attached as a PDF.
          </p>
          <p style="margin:0 0 12px 0;font-size:12px;line-height:1.55;color:#98a2b3;">
            Compiled from publicly available information and licensed data providers. ${brand.name} is not a consumer reporting agency under the Fair Credit Reporting Act — do not use this report for employment, tenancy, credit, insurance, or any other FCRA-governed decision.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 28px;background:#f8fafc;font-size:12px;color:#98a2b3;border-top:1px solid #eef0f4;">
          ${brand.name} · ${brand.domain}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
