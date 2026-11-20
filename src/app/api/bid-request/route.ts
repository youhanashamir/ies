import { NextResponse } from "next/server";
import { batchAttachments, bidIdBanner, mailConfig, row, section, sendMail, wrapHtml, type MailAttachment } from "@/lib/mailer";
import {
  breakdownLabel,
  deadlineLabel,
  generateRequestId,
  num,
  parseArea,
  requestedBudgetLabel,
  serviceLabel,
  systemLabel,
  type BidFormState,
} from "@/lib/calculator";
import { isValidBidId, validateBidState } from "@/lib/bid-validation";
import { allowRequest, clientIp } from "@/lib/rate-limit";
import {
  MAX_PLAN_FILE_BYTES,
  MAX_PLAN_TOTAL_BYTES,
  deleteUpload,
  isValidUploadId,
  parseManifest,
  readUploadedPlans,
} from "@/lib/plan-uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Plans plus form fields and multipart overhead. Checked before the body is buffered.
// Plans normally arrive pre-uploaded in chunks (see /api/bid-upload), so this only
// matters for direct uploads.
const MAX_REQUEST_BYTES = MAX_PLAN_TOTAL_BYTES + 1024 * 1024;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status });
}

function projectText(state: BidFormState, bidId: string, planNames: string[]) {
  const area = parseArea(state.area);
  const systems = state.systems.length ? state.systems.map(systemLabel).join(", ") : "—";
  const notes = state.specialInstructions;

  return [
    "INTERNATIONAL ESTIMATING — BID REQUEST",
    `Bid ID: ${bidId}`,
    "",
    `Client: ${state.clientName}${state.companyName ? ` · ${state.companyName}` : ""}`,
    `Email: ${state.email}${state.phone ? ` · Phone: ${state.phone}` : ""}`,
    "",
    `Project: ${state.projectName}`,
    `Type: ${state.projectType || "—"}${state.projectLocation ? ` · Location: ${state.projectLocation}` : ""}`,
    `Area: ${area ? `${num.format(area)} sq ft` : "—"}${state.floors ? ` · Floors: ${state.floors}` : ""}${state.sheets ? ` · Drawing sheets: ${state.sheets}` : ""}`,
    `Attached PDF plans: ${planNames.join(", ")}`,
    "",
    `Service: ${serviceLabel(state.service)}`,
    `Client requested service budget: ${requestedBudgetLabel(state.requestedBudget, state.requestedBudgetCurrency)}`,
    `Systems: ${systems}`,
    `Drawings: ${state.drawingStatus || "—"}`,
    `Quantity breakdown: ${state.breakdown.map(breakdownLabel).join(", ")}`,
    `Preferred deadline: ${deadlineLabel(state.deadline)}`,
    ...(notes ? ["", "SPECIAL INSTRUCTIONS", notes] : []),
    "",
    "Client requested budget is not final pricing. Final fixed pricing is provided after bid, drawings, and scope review.",
  ].join("\n");
}

export async function POST(req: Request) {
  if (!allowRequest(`bid:${clientIp(req)}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return json({ ok: false, error: "Too many bid requests from this connection. Please try again in a few minutes." }, 429);
  }

  const declaredLength = Number(req.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_REQUEST_BYTES) {
    return json({ ok: false, error: "The combined PDF plan upload must be 25 MB or smaller." }, 413);
  }

  if (!(req.headers.get("content-type") ?? "").includes("multipart/form-data")) {
    return json({ ok: false, error: "Invalid bid submission. Please complete the project details and upload your PDF plans." }, 400);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ ok: false, error: "Invalid bid submission. Please complete the project details and upload your PDF plans." }, 400);
  }

  // Honeypot: real users never fill this hidden field. Pretend success and send nothing.
  if (String(form.get("website") ?? "").trim() !== "") {
    return json({ ok: true, requestId: generateRequestId(), delivered: false, clientNotified: false, configured: true, planCount: 0, receivedAt: new Date().toISOString() });
  }

  let rawState: unknown;
  try {
    rawState = JSON.parse(String(form.get("state") ?? ""));
  } catch {
    return json({ ok: false, error: "Missing project details." }, 400);
  }

  const validated = validateBidState(rawState);
  if (!validated.ok) return json({ ok: false, error: validated.error }, 400);
  const state = validated.state;

  const uploadId = String(form.get("uploadId") ?? "");
  try {
    const plans = await collectPlans(form, uploadId);
    if (!plans.ok) return json({ ok: false, error: plans.error }, plans.status);
    return await handleBid(form, state, plans.files);
  } finally {
    if (isValidUploadId(uploadId)) await deleteUpload(uploadId);
  }
}

type PlanFile = { name: string; data: Buffer };
type PlansResult = { ok: true; files: PlanFile[] } | { ok: false; error: string; status: number };

const isPdfBuffer = (data: Buffer) => data.subarray(0, 5).toString("latin1") === "%PDF-";

/** Plans come from the chunked upload store (normal path) or directly in the form. */
async function collectPlans(form: FormData, uploadId: string): Promise<PlansResult> {
  let files: PlanFile[];

  if (uploadId) {
    if (!isValidUploadId(uploadId)) return { ok: false, error: "Invalid upload. Please submit again.", status: 400 };
    let rawManifest: unknown;
    try {
      rawManifest = JSON.parse(String(form.get("plans_manifest") ?? ""));
    } catch {
      return { ok: false, error: "Missing PDF plan details. Please submit again.", status: 400 };
    }
    const manifest = parseManifest(rawManifest);
    if (!manifest.ok) return { ok: false, error: manifest.error, status: 400 };
    const stored = await readUploadedPlans(uploadId, manifest.manifest);
    if (!stored.ok) return { ok: false, error: stored.error, status: 400 };
    files = stored.files;
  } else {
    const planFiles = form.getAll("plans").filter((value): value is File => value instanceof File && value.size > 0);
    if (planFiles.length === 0) {
      return { ok: false, error: "At least one PDF project plan is required. Upload working, building, electrical, MEP, or structural plans.", status: 400 };
    }
    if (planFiles.some((file) => file.size > MAX_PLAN_FILE_BYTES)) {
      return { ok: false, error: "Each PDF plan file must be 15 MB or smaller.", status: 413 };
    }
    if (planFiles.reduce((total, file) => total + file.size, 0) > MAX_PLAN_TOTAL_BYTES) {
      return { ok: false, error: "The combined PDF plan upload must be 25 MB or smaller.", status: 413 };
    }
    files = await Promise.all(planFiles.map(async (file) => ({ name: file.name, data: Buffer.from(await file.arrayBuffer()) })));
  }

  for (const file of files) {
    if (!file.name.toLowerCase().endsWith(".pdf") || !isPdfBuffer(file.data)) {
      return { ok: false, error: `“${file.name}” is not a valid PDF. Only PDF plan files can be submitted.`, status: 400 };
    }
  }
  return { ok: true, files };
}

async function handleBid(form: FormData, state: BidFormState, planFiles: PlanFile[]) {
  const submittedId = String(form.get("bid_id") ?? "").trim();
  const bidId = isValidBidId(submittedId) ? submittedId : generateRequestId();

  const { to: companyEmail, configured } = mailConfig();
  const area = parseArea(state.area);
  const systems = state.systems.length ? state.systems.map((id) => systemLabel(id)).join(", ") : "—";
  const planNames = planFiles.map((file) => file.name);
  const attachments: MailAttachment[] = planFiles.map((file) => ({ filename: file.name, content: file.data.toString("base64") }));
  // Large plan sets are split across several emails to stay under provider size limits.
  const batches = batchAttachments(attachments);
  const partNote = batches.length > 1 ? ` The PDF plans are split across ${batches.length} emails because of their size.` : "";
  const fullText = projectText(state, bidId, planNames);
  const footnote = "Client requested budgets are not final quotations. We review the bid, drawings, and scope before providing final fixed pricing. Keep your Bid ID for any future change request.";

  const internalDetails = `
    ${bidIdBanner(bidId)}
    <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#374151">A new bid request has been submitted with PDF plans attached.${partNote} Reply directly to the client email to continue.</p>
    ${section("Client", [row("Name", state.clientName), row("Company", state.companyName), row("Email", state.email), row("Phone", state.phone)].join(""))}
    ${section("Project & plans", [
      row("Project", state.projectName),
      row("Type", state.projectType),
      row("Location", state.projectLocation),
      row("Area", area ? `${num.format(area)} sq ft` : ""),
      row("Floors / Drawing sheets", [state.floors && `${state.floors} floors`, state.sheets && `${state.sheets} sheets`].filter(Boolean).join(" · ")),
      row("Attached PDF plans", planNames.join(", ")),
    ].join(""))}
    ${section("Requested estimating", [
      row("Service", serviceLabel(state.service)),
      row("Client requested service budget", requestedBudgetLabel(state.requestedBudget, state.requestedBudgetCurrency)),
      row("Systems", systems),
      row("Drawing status", state.drawingStatus),
      row("Quantity breakdown", state.breakdown.map(breakdownLabel).join(", ")),
      row("Preferred deadline", deadlineLabel(state.deadline)),
    ].join(""))}
    ${state.specialInstructions
      ? section("Special Client Instructions", row("Instructions", state.specialInstructions))
      : ""}
  `;

  const clientDetails = `
    ${bidIdBanner(bidId)}
    <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#374151"><strong>Your bid is in review.</strong> We have received your project request and PDF plans. Our team will review the bid, drawings, and scope details, then contact you at the email address or phone number you provided with the final fixed pricing.</p>
    ${section("Your submitted request", [
      row("Bid ID", bidId),
      row("Project", state.projectName),
      row("Project type", state.projectType),
      row("Project area", area ? `${num.format(area)} sq ft` : ""),
      row("Submitted PDF plans", planNames.join(", ")),
      row("Estimating service", serviceLabel(state.service)),
      row("Your requested service budget", requestedBudgetLabel(state.requestedBudget, state.requestedBudgetCurrency)),
      row("Selected systems", systems),
      row("Preferred deadline", deadlineLabel(state.deadline)),
      ...(state.specialInstructions ? [row("Special Client Instructions", state.specialInstructions)] : []),
    ].join(""))}
    <p style="margin:22px 0 0;font-size:15px;line-height:1.6;color:#374151">For any future inquiry or change, reply to this email and include your Bid ID.</p>
  `;

  let delivered = false;
  let clientNotified = false;
  let error: string | undefined;

  if (configured && companyEmail) {
    const partSubject = (index: number) => (batches.length > 1 ? ` (plans ${index + 1} of ${batches.length})` : "");
    const sendCompanyEmails = async () => {
      // Sequential so the parts arrive in order and SMTP isn't hit with parallel large messages.
      const results = [];
      for (const [index, batch] of batches.entries()) {
        const names = batch.map((a) => a.filename);
        results.push(
          await sendMail(
            index === 0
              ? {
                  to: companyEmail,
                  replyTo: state.email,
                  subject: `[${bidId}] New bid request — ${state.projectName}${partSubject(index)}`,
                  html: wrapHtml(`New bid request — ${state.projectName}`, internalDetails, footnote),
                  text: fullText,
                  attachments: batch,
                }
              : {
                  to: companyEmail,
                  replyTo: state.email,
                  subject: `[${bidId}] PDF plans — ${state.projectName}${partSubject(index)}`,
                  html: wrapHtml(
                    `PDF plans, part ${index + 1} of ${batches.length}`,
                    `${bidIdBanner(bidId)}${section("Attached in this email", row("PDF plans", names.join(", ")))}`,
                  ),
                  text: `Bid ID: ${bidId}\nProject: ${state.projectName}\nPDF plans, part ${index + 1} of ${batches.length}: ${names.join(", ")}`,
                  attachments: batch,
                },
          ),
        );
      }
      const failed = results.find((r) => !r.delivered);
      return failed ?? results[0];
    };

    const [companyResult, clientResult] = await Promise.all([
      sendCompanyEmails(),
      sendMail({
        to: state.email,
        replyTo: companyEmail,
        subject: `Bid request received — your bid is in review (${bidId})`,
        html: wrapHtml("Your bid request has been received", clientDetails, footnote),
        text: fullText,
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
    console.warn(`[bid-request] ${bidId} received but email is not configured (set SMTP_HOST/SMTP_USER/SMTP_PASS or RESEND_API_KEY + CONTACT_FROM_EMAIL).`);
  } else if (error) {
    console.error(`[bid-request] ${bidId} delivery issue: ${error}`);
  }

  return json({
    ok: true,
    requestId: bidId,
    delivered,
    clientNotified,
    configured,
    planCount: planFiles.length,
    receivedAt: new Date().toISOString(),
  });
}
