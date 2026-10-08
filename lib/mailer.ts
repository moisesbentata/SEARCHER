import nodemailer from "nodemailer";
import { brand } from "@/lib/brand";

const user = process.env.GMAIL_USER;
const pass = process.env.GMAIL_APP_PASSWORD;

function requireEnv(): { user: string; pass: string } {
  if (!user || !pass) {
    throw new Error(
      "GMAIL_USER and GMAIL_APP_PASSWORD must be set for email sending.",
    );
  }
  return { user, pass };
}

const transporter = user && pass
  ? nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    })
  : null;

export async function sendOtpEmail(toEmail: string, code: string): Promise<void> {
  const { user: fromUser } = requireEnv();
  if (!transporter) throw new Error("Mail transporter is not configured.");

  const subject = `${code} is your ${brand.name} verification code`;
  const text = `${code}

Enter this code on ${brand.name} to finish signing in. It expires in 10 minutes.

If you didn't request this, you can ignore this email — someone may have typed your address by mistake.`;
  const html = otpHtml(code);

  await transporter.sendMail({
    from: `"${brand.name}" <${fromUser}>`,
    to: toEmail,
    subject,
    text,
    html,
  });
}

function otpHtml(code: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#101828;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #eef0f4;">
      <tr>
        <td style="padding:28px 28px 8px 28px;">
          <div style="font-size:14px;color:#667085;">${brand.name}</div>
          <h1 style="margin:8px 0 20px 0;font-size:20px;color:#101828;">Your verification code</h1>
          <div style="font-size:34px;font-weight:700;letter-spacing:6px;color:#101828;background:#f3f5fb;border-radius:10px;padding:16px 20px;text-align:center;">${code}</div>
          <p style="margin:20px 0 0 0;font-size:14px;line-height:1.55;color:#475467;">Enter this code on ${brand.name} to finish signing in. It expires in 10 minutes.</p>
          <p style="margin:12px 0 0 0;font-size:13px;line-height:1.55;color:#98a2b3;">If you didn't request this, you can ignore this email — someone may have typed your address by mistake.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 28px 28px 28px;font-size:12px;color:#98a2b3;">
          ${brand.name} · ${brand.domain}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function verifyMailerConnection(): Promise<{ok: true} | {ok: false; error: string}> {
  if (!transporter) return { ok: false, error: "Transporter not configured (missing env vars)." };
  try {
    await transporter.verify();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
