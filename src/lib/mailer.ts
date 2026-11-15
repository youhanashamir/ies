/**
 * Resend mailer (server-side only).
 *
 * Required environment variables:
 *   RESEND_API_KEY       — Resend API key (starts with re_)
 *   CONTACT_FROM_EMAIL   — verified sender, e.g. "International Estimating <bids@yourdomain.com>"
 *   CONTACT_TO_EMAIL     — company inbox that receives all submissions
 *   NEXT_PUBLIC_CONTACT_EMAIL — same inbox, exposed to the browser for mailto buttons
 */

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

export function mailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  // Requires a verified sender. The Resend test sender (onboarding@resend.dev) only
  // delivers to the account owner, so falling back to it would silently drop client emails.
  return { apiKey, to, from, configured: Boolean(apiKey && to && from) };
}

export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  const { apiKey, from } = mailConfig();
  if (!apiKey || !from) return { delivered: false, reason: "not-configured" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
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
