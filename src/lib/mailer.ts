/**
 * Server-side mailer. Two transports are supported; whichever is configured is used.
 *
 * Option A: SMTP (e.g. Gmail with an App Password)
 *   SMTP_HOST            e.g. smtp.gmail.com
 *   SMTP_PORT            465 (SSL, default) or 587 (STARTTLS)
 *   SMTP_USER            full mailbox address
 *   SMTP_PASS            app password (not the normal account password)
 *
 * Option B: Resend (https://resend.com), used when RESEND_API_KEY is set
 *   RESEND_API_KEY       starts with re_
 *   CONTACT_FROM_EMAIL   required: a sender on a domain verified in Resend
 *
 * Shared:
 *   CONTACT_TO_EMAIL     inbox that receives submissions (defaults to the public contact email)
 *   CONTACT_FROM_EMAIL   sender, e.g. "International Estimating <you@gmail.com>" (SMTP defaults to SMTP_USER)
 */
import nodemailer from "nodemailer";
import { CONTACT_EMAIL } from "@/lib/contact";

export type MailAttachment = {
  filename: string;
  /** base64-encoded file content */
  content: string;
};

export type SendMailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: MailAttachment[];
};

export type SendMailResult =
  | { delivered: true; id: string }
  | { delivered: false; reason: "not-configured" | "error"; error?: string };

/**
 * Upper bound for the base64 attachment payload of one message. Gmail rejects
 * messages over 25 MB (including encoding), so larger plan sets are split
 * across several emails by `batchAttachments`.
 */
export const MAX_ATTACHMENT_BASE64_PER_EMAIL = 21 * 1024 * 1024;

const env = (key: string) => process.env[key]?.trim() || undefined;

export function mailConfig() {
  const apiKey = env("RESEND_API_KEY");
  const smtpHost = env("SMTP_HOST");
  const smtpUser = env("SMTP_USER");
  const smtpPass = env("SMTP_PASS")?.replace(/\s+/g, "");
  const smtpPort = Number(env("SMTP_PORT") ?? 465);
  const smtpReady = Boolean(smtpHost && smtpUser && smtpPass);

  const transport: "resend" | "smtp" | null = apiKey ? "resend" : smtpReady ? "smtp" : null;
  const to = env("CONTACT_TO_EMAIL") ?? CONTACT_EMAIL;
  // Resend needs an explicitly verified sender; its test sender only delivers to the
  // account owner, so falling back to it would silently drop client emails.
  const from =
    env("CONTACT_FROM_EMAIL") ?? (transport === "smtp" ? `International Estimating <${smtpUser}>` : undefined);

  return {
    transport,
    apiKey,
    smtp: { host: smtpHost, port: smtpPort, user: smtpUser, pass: smtpPass },
    to,
    from,
    configured: Boolean(transport && to && from),
  };
}

let smtpTransporter: nodemailer.Transporter | null = null;

function getSmtpTransporter(smtp: ReturnType<typeof mailConfig>["smtp"]) {
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.pass },
    });
  }
  return smtpTransporter;
}

export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  const config = mailConfig();
  if (!config.configured || !config.from) return { delivered: false, reason: "not-configured" };

  try {
    if (config.transport === "smtp") {
      const info = await getSmtpTransporter(config.smtp).sendMail({
        from: config.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: input.replyTo,
        attachments: input.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
          encoding: "base64",
          contentType: a.filename.toLowerCase().endsWith(".pdf") ? "application/pdf" : undefined,
        })),
      });
      return { delivered: true, id: info.messageId ?? "sent" };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: input.replyTo,
        attachments: input.attachments?.map((attachment) => ({
          filename: attachment.filename,
          content: attachment.content,
        })),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { delivered: false, reason: "error", error: `Resend ${res.status}: ${body}` };
    }

    const data = (await res.json()) as { id?: string };
    return { delivered: true, id: data.id ?? "sent" };
  } catch (err) {
    return { delivered: false, reason: "error", error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/** Groups attachments so each email stays under the provider's message size limit. */
export function batchAttachments(attachments: MailAttachment[], maxBase64 = MAX_ATTACHMENT_BASE64_PER_EMAIL) {
  const batches: MailAttachment[][] = [];
  let current: MailAttachment[] = [];
  let size = 0;
  for (const attachment of attachments) {
    if (current.length && size + attachment.content.length > maxBase64) {
      batches.push(current);
      current = [];
      size = 0;
    }
    current.push(attachment);
    size += attachment.content.length;
  }
  if (current.length) batches.push(current);
  return batches;
}

/* ------------------------------------------------------------------ */
/* Email HTML helpers                                                  */
/* ------------------------------------------------------------------ */
export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function row(label: string, value: unknown) {
  const v = value === undefined || value === null || value === "" ? "—" : escapeHtml(value);
  return `<tr>
    <td style="width:38%;padding:11px 14px;border-bottom:1px solid #e7eaf0;background:#f7f8fa;color:#5e6879;font-size:12px;font-weight:700;letter-spacing:.025em;vertical-align:top">${escapeHtml(label)}</td>
    <td style="padding:11px 14px;border-bottom:1px solid #e7eaf0;color:#231B4A;font-size:14px;font-weight:700;line-height:1.5;vertical-align:top;white-space:pre-wrap">${v}</td>
  </tr>`;
}

export function section(title: string, rowsHtml: string) {
  return `<h3 style="margin:25px 0 8px;padding-left:10px;border-left:3px solid #6B3DF4;font:700 11px/1.4 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#231B4A">${escapeHtml(title)}</h3>
  <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #e1e5eb">${rowsHtml}</table>`;
}

export function bidIdBanner(bidId: string) {
  return `<div style="margin:20px 0 22px;padding:14px 16px;background:#f1edff;border-left:4px solid #6B3DF4">
    <div style="margin-bottom:3px;color:#4d2fc7;font:700 10px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase">Bid ID</div>
    <div style="color:#231B4A;font:800 21px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.04em">${escapeHtml(bidId)}</div>
  </div>`;
}

export function wrapHtml(title: string, bodyHtml: string, footnote?: string) {
  return `<!doctype html>
<html><body style="margin:0;background:#f1f3f6;padding:28px 14px;font-family:Arial,Helvetica,sans-serif;color:#231B4A">
  <div style="max-width:700px;margin:0 auto;background:#ffffff;border:1px solid #dfe4eb">
    <div style="padding:22px 30px;background:#231B4A;color:#ffffff">
      <div style="font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#a68bff">International Estimating</div>
      <div style="margin-top:8px;font-size:12px;line-height:1.4;color:#d7dde7">Electrical &amp; MEP Estimating Services</div>
    </div>
    <div style="padding:30px">
      <h1 style="margin:0;color:#231B4A;font-size:25px;line-height:1.18;letter-spacing:-.02em">${escapeHtml(title)}</h1>
      ${bodyHtml}
      ${footnote ? `<p style="margin:26px 0 0;padding-top:16px;border-top:1px solid #e7eaf0;font-size:12px;color:#687386;line-height:1.65">${escapeHtml(footnote)}</p>` : ""}
    </div>
    <div style="padding:14px 30px;background:#f7f8fa;color:#687386;font-size:11px;line-height:1.5">International Estimating · Accurate Takeoffs. Reliable Estimates. Confident Bids.</div>
  </div>
</body></html>`;
}
