import { DRAWING_STATUS, ESTIMATING_SERVICES, PROJECT_TYPES, QUANTITY_BREAKDOWN, SYSTEMS } from "@/lib/content";
import { CURRENCIES, DEADLINES, type BidFormState } from "@/lib/calculator";

type Result = { ok: true; state: BidFormState } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIMITS = {
  short: 200,
  email: 254,
  phone: 40,
  number: 20,
  notes: 5000,
} as const;

/** Reads an optional string field, enforcing type and length. */
function readText(raw: Record<string, unknown>, key: string, max: number, label: string): { value: string } | { error: string } {
  const value = raw[key];
  if (value === undefined || value === null) return { value: "" };
  if (typeof value !== "string") return { error: `${label} must be text.` };
  const trimmed = value.trim();
  if (trimmed.length > max) return { error: `${label} must be ${max} characters or fewer.` };
  return { value: trimmed };
}

function readEnum<T extends string>(value: unknown, allowed: readonly T[], label: string): { value: T } | { error: string } {
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    return { error: `${label} is not a valid option.` };
  }
  return { value: value as T };
}

function readList(value: unknown, allowed: readonly string[], label: string, min: number, max: number): { value: string[] } | { error: string } {
  if (!Array.isArray(value)) return { error: `${label} must be a list.` };
  if (value.length < min) return { error: `${label} is required.` };
  if (value.length > max) return { error: `${label} has too many entries.` };
  const unique = Array.from(new Set(value));
  for (const item of unique) {
    if (typeof item !== "string" || !allowed.includes(item)) return { error: `${label} contains an invalid option.` };
  }
  return { value: unique as string[] };
}

/** Validates and normalizes the bid form state received from the browser. */
export function validateBidState(input: unknown): Result {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "Missing project details." };
  }
  const raw = input as Record<string, unknown>;

  const text = (key: string, max: number, label: string) => readText(raw, key, max, label);
  const fields = {
    clientName: text("clientName", LIMITS.short, "Client name"),
    companyName: text("companyName", LIMITS.short, "Company name"),
    email: text("email", LIMITS.email, "Email address"),
    phone: text("phone", LIMITS.phone, "Phone number"),
    projectName: text("projectName", LIMITS.short, "Project name"),
    projectLocation: text("projectLocation", LIMITS.short, "Project location"),
    area: text("area", LIMITS.number, "Project area"),
    floors: text("floors", LIMITS.number, "Floors"),
    sheets: text("sheets", LIMITS.number, "Drawing sheets"),
    requestedBudget: text("requestedBudget", LIMITS.number, "Requested budget"),
    specialInstructions: text("specialInstructions", LIMITS.notes, "Special instructions"),
  };

  for (const field of Object.values(fields)) {
    if ("error" in field) return { ok: false, error: field.error };
  }
  const val = (key: keyof typeof fields) => (fields[key] as { value: string }).value;

  if (!val("clientName")) return { ok: false, error: "Client name is required." };
  if (!val("projectName")) return { ok: false, error: "Project name is required." };
  if (!EMAIL_RE.test(val("email"))) return { ok: false, error: "Please provide a valid email address." };

  const projectType = readEnum(raw.projectType, PROJECT_TYPES, "Project type");
  if ("error" in projectType) return { ok: false, error: projectType.error };

  const service = readEnum(raw.service, ESTIMATING_SERVICES.map((s) => s.id), "Estimating service");
  if ("error" in service) return { ok: false, error: service.error };

  const deadline = readEnum(raw.deadline, DEADLINES.map((d) => d.id), "Preferred deadline");
  if ("error" in deadline) return { ok: false, error: deadline.error };

  const drawingStatus = readEnum(raw.drawingStatus, DRAWING_STATUS, "Drawing status");
  if ("error" in drawingStatus) return { ok: false, error: drawingStatus.error };

  const currency = readEnum(raw.requestedBudgetCurrency, CURRENCIES, "Budget currency");
  if ("error" in currency) return { ok: false, error: currency.error };

  const systems = readList(raw.systems, SYSTEMS.map((s) => s.id), "Systems", 1, SYSTEMS.length);
  if ("error" in systems) return { ok: false, error: systems.error };

  const breakdown = readList(raw.breakdown, QUANTITY_BREAKDOWN.map((b) => b.id), "Quantity breakdown", 1, 1);
  if ("error" in breakdown) return { ok: false, error: breakdown.error };

  return {
    ok: true,
    state: {
      clientName: val("clientName"),
      companyName: val("companyName"),
      email: val("email"),
      phone: val("phone"),
      projectName: val("projectName"),
      projectType: projectType.value,
      projectLocation: val("projectLocation"),
      area: val("area"),
      floors: val("floors"),
      sheets: val("sheets"),
      service: service.value,
      requestedBudget: val("requestedBudget"),
      requestedBudgetCurrency: currency.value,
      systems: systems.value,
      deadline: deadline.value,
      drawingStatus: drawingStatus.value,
      breakdown: breakdown.value,
      specialInstructions: val("specialInstructions"),
    },
  };
}

/** Bid IDs issued by the app: IES-XXXX-XXXX-XXXX from generateRequestId's alphabet. */
const BID_ID_RE = /^IES-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/;

export function isValidBidId(value: string) {
  return BID_ID_RE.test(value);
}

/** Checks the file's magic bytes, not just its name or declared MIME type. */
export async function isPdfContent(file: File) {
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return header.length === 5 && String.fromCharCode(...header) === "%PDF-";
}
