import { NextResponse } from "next/server";
import { escapeHtml, mailConfig, row, section, sendMail, wrapHtml, type MailAttachment } from "@/lib/mailer";
import { generateRequestId } from "@/lib/calculator";
import { allowRequest, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_ATTACHMENT_BYTES + 512 * 1024;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 10 * 60 * 1000;
// Mirrors the file picker's accept list in InquiryForm.
const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".zip", ".dwg", ".xlsx", ".xls", ".doc", ".docx"];

const LIMITS = { name: 200, email: 254, subject: 200, question: 5000 } as const;

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(req: Request) {
  if (!allowRequest(`inquiry:${clientIp(req)}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return json({ ok: false, error: "Too many inquiries from this connection. Please try again in a few minutes." }, 429);
  }

  const declaredLength = Number(req.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_REQUEST_BYTES) {
    return json({ ok: false, error: "Attachment must be 5 MB or smaller." }, 413);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ ok: false, error: "Invalid submission." }, 400);
  }

  // Honeypot: real users never fill this hidden field. Pretend success and send nothing.
  if (String(form.get("website") ?? "").trim() !== "") {
    return json({ ok: true, inquiryId: generateRequestId().replace(/^IES-/, "INQ-"), delivered: false, clientNotified: false, configured: true, receivedAt: new Date().toISOString() });
  }

  const fullName = String(form.get("fullName") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const subject = String(form.get("subject") ?? "").trim();
  const question = String(form.get("question") ?? "").trim();
  const file = form.get("attachment");
  const attachment = file instanceof File && file.size > 0 ? file : null;

  if (!fullName || !subject || !question) {
    return json({ ok: false, error: "Name, subject, and question are required." }, 400);
  }
  if (fullName.length > LIMITS.name || subject.length > LIMITS.subject || question.length > LIMITS.question || email.length > LIMITS.email) {
    return json({ ok: false, error: "One of the fields is too long. Please shorten it and try again." }, 400);
  }
  if (!isEmail(email)) {
    return json({ ok: false, error: "Please provide a valid email address." }, 400);
  }
  if (attachment && attachment.size > MAX_ATTACHMENT_BYTES) {
    return json({ ok: false, error: "Attachment must be 5 MB or smaller." }, 413);
  }
  if (attachment && !ALLOWED_EXTENSIONS.some((ext) => attachment.name.toLowerCase().endsWith(ext))) {
    return json({ ok: false, error: "That attachment type is not accepted. Please attach a PDF, image, archive, CAD, spreadsheet, or document file." }, 400);
  }

  const inquiryId = generateRequestId().replace(/^IES-/, "INQ-");
  const { to: companyEmail, configured } = mailConfig();
  const text = [
    "INTERNATIONAL ESTIMATING — INQUIRY",
    `Inquiry ID: ${inquiryId}`,
    "",
    `Name: ${fullName}`,
    `Email: ${email}`,
    "",
    `Subject: ${subject}`,
    "",
    question,
    attachment ? `\nAttachment: ${attachment.name}` : "",
  ].join("\n");

  const attachments: MailAttachment[] = attachment
    ? [{ filename: attachment.name, content: Buffer.from(await attachment.arrayBuffer()).toString("base64") }]
    : [];

  const internalDetails = `
    <div style="margin:20px 0 22px;padding:14px 16px;background:#f1edff;border-left:4px solid #6B3DF4">
      <div style="margin-bottom:3px;color:#4d2fc7;font:700 10px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase">Inquiry ID</div>
      <div style="color:#231B4A;font:800 21px/1.2 ui-monospace,Menlo,monospace">${escapeHtml(inquiryId)}</div>
    </div>
    ${section("Client", [row("Name", fullName), row("Email", email)].join(""))}
    ${section("Question", [row("Subject", subject), row("Message", question), row("Attachment", attachment?.name || "None")].join(""))}
    <p style="margin:22px 0 0;font-size:15px;line-height:1.6;color:#374151">Reply directly to the client's email to continue the conversation.</p>
  `;

  const clientDetails = `
    <div style="margin:20px 0 22px;padding:14px 16px;background:#f1edff;border-left:4px solid #6B3DF4">
      <div style="margin-bottom:3px;color:#4d2fc7;font:700 10px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase">Inquiry ID</div>
      <div style="color:#231B4A;font:800 21px/1.2 ui-monospace,Menlo,monospace">${escapeHtml(inquiryId)}</div>
    </div>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#374151">We have received your question: <strong>${escapeHtml(subject)}</strong>. Our estimating team will review it and reply to this email address. Keep your Inquiry ID for future reference.</p>
    ${section("Your message", [row("Subject", subject), row("Question", question)].join(""))}
  `;

  let delivered = false;
  let clientNotified = false;
  let error: string | undefined;

  if (configured && companyEmail) {
    const [companyResult, clientResult] = await Promise.all([
      sendMail({
        to: companyEmail,
        replyTo: email,
        subject: `[${inquiryId}] Question — ${subject}`,
        html: wrapHtml(`New inquiry — ${subject}`, internalDetails),
        text,
        attachments,
      }),
      sendMail({
        to: email,
        replyTo: companyEmail,
        subject: `We received your question (${inquiryId})`,
        html: wrapHtml("Your question has been received", clientDetails),
        text,
      }),
    ]);
    delivered = companyResult.delivered;
    clientNotified = clientResult.delivered;
    const errors = [
      !companyResult.delivered && `Company email: ${companyResult.error ?? companyResult.reason}`,
      !clientResult.delivered && `Client email: ${clientResult.error ?? clientResult.reason}`,
    ].filter(Boolean);
    error = errors.length ? errors.join(" | ") : undefined;
  }

  if (!configured) {
    console.warn(`[inquiry] ${inquiryId} received but email is not configured (set SMTP_HOST/SMTP_USER/SMTP_PASS or RESEND_API_KEY + CONTACT_FROM_EMAIL).`);
  } else if (error) {
    console.error(`[inquiry] ${inquiryId} delivery issue: ${error}`);
  }

  // `status` lets the client tell "not configured" apart from "send failed".
  const status = !configured ? "not-configured" : delivered ? "sent" : "delivery-failed";

  return json({ ok: true, inquiryId, delivered, clientNotified, configured, status, receivedAt: new Date().toISOString() });
}
