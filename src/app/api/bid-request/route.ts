import { NextResponse } from "next/server";
import { bidIdBanner, escapeHtml, mailConfig, row, section, sendMail, wrapHtml, type MailAttachment } from "@/lib/mailer";
import {
  CURRENCIES,
  breakdownLabel,
  deadlineLabel,
  generateRequestId,
  num,
  parseArea,
  serviceLabel,
  systemLabel,
  type BidFormState,
} from "@/lib/calculator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PLAN_FILE_BYTES = 15 * 1024 * 1024;
const MAX_PLAN_TOTAL_BYTES = 25 * 1024 * 1024;

type Payload = { requestId?: string; state: BidFormState };

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function requestedBudgetLabel(state: BidFormState) {
  const raw = String(state.requestedBudget ?? "").trim();
  const amount = Number(raw.replace(/,/g, ""));
  const currency = CURRENCIES.includes(state.requestedBudgetCurrency) ? state.requestedBudgetCurrency : "USD";
  if (!raw || !Number.isFinite(amount) || amount <= 0) return "Not provided";
  return `${new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)} — client requested, not final pricing`;
}

async function parseBidRequest(req: Request): Promise<{ payload: Payload; planFiles: File[] }> {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const stateJson = form.get("state");
    if (typeof stateJson !== "string") throw new Error("Missing project details.");
    const payload: Payload = {
      requestId: typeof form.get("bid_id") === "string" ? String(form.get("bid_id")) : undefined,
      state: JSON.parse(stateJson) as BidFormState,
    };
    const planFiles = form.getAll("plans").filter((value): value is File => value instanceof File && value.size > 0);
    return { payload, planFiles };
  }
  const payload = (await req.json()) as Payload;
  return { payload, planFiles: [] };
}

function projectText(state: BidFormState, bidId: string, planNames: string[]) {
  const area = parseArea(state.area);
  const systems = state.systems.length ? state.systems.map(systemLabel).join(", ") : "—";
  const notes = String(state.specialInstructions ?? "").trim();

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
    `Client requested service budget: ${requestedBudgetLabel(state)}`,
    `Systems: ${systems}`,
    `Drawings: ${state.drawingStatus || "—"}`,
    `Quantity breakdown: ${state.breakdown.length ? state.breakdown.map(breakdownLabel).join(", ") : "—"}`,
    `Preferred deadline: ${deadlineLabel(state.deadline)}`,
    ...(notes ? ["", "SPECIAL INSTRUCTIONS", notes] : []),
    "",
    "Client requested budget is not final pricing. Final fixed pricing is provided after bid, drawings, and scope review.",
  ].join("\n");
}

export async function POST(req: Request) {
  let payload: Payload;
  let planFiles: File[];
  try {
    ({ payload, planFiles } = await parseBidRequest(req));
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid bid submission. Please complete the project details and upload your PDF plans." }, { status: 400 });
  }

  const state = payload?.state;
  if (!state || typeof state !== "object") {
    return NextResponse.json({ ok: false, error: "Missing project details." }, { status: 400 });
  }

  const required: [keyof BidFormState, string][] = [
    ["clientName", "Client name"],
    ["email", "Email address"],
    ["projectName", "Project name"],
    ["projectType", "Project type"],
    ["service", "Estimating service"],
  ];
  for (const [key, label] of required) {
    if (!String(state[key] ?? "").trim()) {
      return NextResponse.json({ ok: false, error: `${label} is required.` }, { status: 400 });
    }
  }
  if (!isEmail(state.email)) {
    return NextResponse.json({ ok: false, error: "Please provide a valid email address." }, { status: 400 });
  }
  const requestedBudget = Number(String(state.requestedBudget ?? "").replace(/,/g, ""));
  if (!String(state.requestedBudget ?? "").trim() || !Number.isFinite(requestedBudget) || requestedBudget <= 0 || !CURRENCIES.includes(state.requestedBudgetCurrency)) {
    return NextResponse.json({ ok: false, error: "Please provide a valid requested service budget and currency." }, { status: 400 });
  }
  if (planFiles.length === 0) {
    return NextResponse.json({ ok: false, error: "At least one PDF project plan is required. Upload working, building, electrical, MEP, or structural plans." }, { status: 400 });
  }
  if (planFiles.some((file) => !isPdf(file))) {
    return NextResponse.json({ ok: false, error: "Only PDF plan files can be submitted." }, { status: 400 });
  }
  if (planFiles.some((file) => file.size > MAX_PLAN_FILE_BYTES)) {
    return NextResponse.json({ ok: false, error: "Each PDF plan file must be 15 MB or smaller." }, { status: 400 });
  }
  if (planFiles.reduce((total, file) => total + file.size, 0) > MAX_PLAN_TOTAL_BYTES) {
    return NextResponse.json({ ok: false, error: "The combined PDF plan upload must be 25 MB or smaller." }, { status: 400 });
  }

  const bidId = payload.requestId?.trim() || generateRequestId();
  const area = parseArea(state.area);
  const { to: companyEmail, configured } = mailConfig();
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
      row("Client requested service budget", requestedBudgetLabel(state)),
      row("Systems", systems),
      row("Drawing status", state.drawingStatus),
      row("Quantity breakdown", state.breakdown.map(breakdownLabel).join(", ")),
      row("Preferred deadline", deadlineLabel(state.deadline)),
    ].join(""))}
    ${state.specialInstructions?.trim()
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
      row("Your requested service budget", requestedBudgetLabel(state)),
      row("Selected systems", systems),
      row("Preferred deadline", deadlineLabel(state.deadline)),
      ...(state.specialInstructions?.trim() ? [row("Special Client Instructions", state.specialInstructions)] : []),
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
    console.info(`[bid-request] ${bidId} received (RESEND_API_KEY / CONTACT_TO_EMAIL not configured).`);
  } else if (error) {
    console.error(`[bid-request] ${bidId} delivery issue: ${error}`);
  }

  return NextResponse.json({
    ok: true,
    requestId: bidId,
    delivered,
    clientNotified,
    configured,
    planCount: planFiles.length,
    receivedAt: new Date().toISOString(),
  });
}
