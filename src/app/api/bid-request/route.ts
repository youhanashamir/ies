import { NextResponse } from "next/server";
import { bidIdBanner, mailConfig, row, section, sendMail, wrapHtml, type MailAttachment } from "@/lib/mailer";
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
import { isPdfContent, isValidBidId, validateBidState } from "@/lib/bid-validation";
import { allowRequest, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PLAN_FILE_BYTES = 15 * 1024 * 1024;
const MAX_PLAN_TOTAL_BYTES = 25 * 1024 * 1024;
// Plans plus form fields and multipart overhead. Checked before the body is buffered.
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

  const planFiles = form.getAll("plans").filter((value): value is File => value instanceof File && value.size > 0);
  if (planFiles.length === 0) {
    return json({ ok: false, error: "At least one PDF project plan is required. Upload working, building, electrical, MEP, or structural plans." }, 400);
  }
  if (planFiles.some((file) => file.size > MAX_PLAN_FILE_BYTES)) {
    return json({ ok: false, error: "Each PDF plan file must be 15 MB or smaller." }, 413);
  }
  if (planFiles.reduce((total, file) => total + file.size, 0) > MAX_PLAN_TOTAL_BYTES) {
    return json({ ok: false, error: "The combined PDF plan upload must be 25 MB or smaller." }, 413);
  }
  for (const file of planFiles) {
    const looksLikePdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!looksLikePdf || !(await isPdfContent(file))) {
      return json({ ok: false, error: `“${file.name}” is not a valid PDF. Only PDF plan files can be submitted.` }, 400);
    }
  }

  const submittedId = String(form.get("bid_id") ?? "").trim();
  const bidId = isValidBidId(submittedId) ? submittedId : generateRequestId();

  const { to: companyEmail, configured } = mailConfig();
  const area = parseArea(state.area);
  const systems = state.systems.length ? state.systems.map((id) => systemLabel(id)).join(", ") : "—";
  const planNames = planFiles.map((file) => file.name);
  const attachments: MailAttachment[] = await Promise.all(
    planFiles.map(async (file) => ({ filename: file.name, content: Buffer.from(await file.arrayBuffer()).toString("base64") })),
  );
  const fullText = projectText(state, bidId, planNames);
  const footnote = "Client requested budgets are not final quotations. We review the bid, drawings, and scope before providing final fixed pricing. Keep your Bid ID for any future change request.";

  const internalDetails = `
    ${bidIdBanner(bidId)}
    <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#374151">A new bid request has been submitted with PDF plans attached. Reply directly to the client email to continue.</p>
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
    const [companyResult, clientResult] = await Promise.all([
      sendMail({
        to: companyEmail,
        replyTo: state.email,
        subject: `[${bidId}] New bid request — ${state.projectName}`,
        html: wrapHtml(`New bid request — ${state.projectName}`, internalDetails, footnote),
        text: fullText,
        attachments,
      }),
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
    console.warn(`[bid-request] ${bidId} received but email is not configured (RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL).`);
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
