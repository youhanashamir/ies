import { NextResponse } from "next/server";
import { escapeHtml, mailConfig, row, section, sendMail, wrapHtml, type MailAttachment } from "@/lib/mailer";
import { generateRequestId } from "@/lib/calculator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid submission." }, { status: 400 });
  }

  const fullName = String(form.get("fullName") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const subject = String(form.get("subject") ?? "").trim();
  const question = String(form.get("question") ?? "").trim();
  const file = form.get("attachment");
  const attachment = file instanceof File && file.size > 0 ? file : null;

  if (!fullName || !subject || !question) {
    return NextResponse.json({ ok: false, error: "Name, subject, and question are required." }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json({ ok: false, error: "Please provide a valid email address." }, { status: 400 });
  }
  if (attachment && attachment.size > MAX_ATTACHMENT_BYTES) {
    return NextResponse.json({ ok: false, error: "Attachment must be 5 MB or smaller." }, { status: 400 });
  }

  const inquiryId = generateRequestId().replace(/^IES-/, "INQ-");
  const { to: companyEmail, configured } = mailConfig();
  const text = [
    "INTERNATIONAL ESTIMATING — INQUIRY",
    `Inquiry ID: ${inquiryId}`,
    "",
    `Name: ${fullName}`,
    `Email: ${email}`,
    
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
  }

  return NextResponse.json({ ok: true, inquiryId, delivered, clientNotified, configured, receivedAt: new Date().toISOString() });
}
