import { ESTIMATING_SERVICES, PROJECT_TYPES, QUANTITY_BREAKDOWN, SYSTEMS } from "@/lib/content";

export type DeadlineId = "flexible" | "standard" | "urgent";
export type ServiceId = (typeof ESTIMATING_SERVICES)[number]["id"];
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const DEADLINES: { id: DeadlineId; label: string; note: string }[] = [
  { id: "flexible", label: "Flexible", note: "More time available for review" },
  { id: "standard", label: "Standard / Normal", note: "Typical bid-cycle turnaround" },
  { id: "urgent", label: "Urgent", note: "Tight bid deadline" },
];

export const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const num = new Intl.NumberFormat("en-US");

// Keep this list deterministic: Intl.supportedValuesOf varies by browser/Node
// version and can otherwise make the server-rendered form fail hydration.
export const CURRENCIES: string[] = [
  "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN",
  "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL",
  "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY",
  "COP", "CRC", "CUC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD",
  "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP",
  "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR",
  "ILS", "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS",
  "KHR", "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR",
  "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP",
  "MRU", "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO",
  "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN",
  "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG",
  "SEK", "SGD", "SHP", "SLE", "SLL", "SOS", "SRD", "SSP", "STN", "SVC",
  "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD",
  "TZS", "UAH", "UGX", "USD", "UYU", "UZS", "VES", "VND", "VUV", "WST",
  "XAF", "XCD", "XCG", "XDR", "XOF", "XPF", "XSU", "YER", "ZAR", "ZMW",
  "ZWG", "ZWL",
];

export type BidFormState = {
  clientName: string;
  companyName: string;
  email: string;
  phone: string;
  projectName: string;
  projectType: ProjectType | "";
  projectLocation: string;
  area: string;
  floors: string;
  sheets: string;
  service: ServiceId | "";
  requestedBudget: string;
  requestedBudgetCurrency: string;
  systems: string[];
  deadline: DeadlineId;
  drawingStatus: string;
  breakdown: string[];
  specialInstructions: string;
};

export const EMPTY_BID: BidFormState = {
  clientName: "",
  companyName: "",
  email: "",
  phone: "",
  projectName: "",
  projectType: "",
  projectLocation: "",
  area: "",
  floors: "",
  sheets: "",
  service: "",
  requestedBudget: "",
  requestedBudgetCurrency: "USD",
  systems: [],
  deadline: "standard",
  drawingStatus: "Complete Drawings",
  breakdown: ["combined"],
  specialInstructions: "",
};

const ELECTRICAL_CORE = ["lighting", "power", "panels", "feeders", "fire-alarm"];
const ELECTRICAL_ALL = [...ELECTRICAL_CORE, "low-voltage", "security"];
const MEP_ALL = [...ELECTRICAL_ALL, "mechanical", "plumbing"];

export function autoSelectSystems(service: ServiceId | "", projectType: ProjectType | ""): string[] {
  let base: string[];
  switch (service) {
    case "takeoff":
      base = [...ELECTRICAL_CORE];
      break;
    case "electrical":
      base = [...ELECTRICAL_ALL];
      break;
    case "mep":
      base = [...MEP_ALL];
      break;
    default:
      base = [...ELECTRICAL_CORE];
  }

  const add = (ids: string[]) => ids.forEach((id) => !base.includes(id) && base.push(id));
  switch (projectType) {
    case "Data Center":
      add(["low-voltage", "security", "panels", "feeders"]);
      if (service === "mep") add(["mechanical"]);
      break;
    case "Healthcare":
    case "Educational":
      add(["fire-alarm", "low-voltage", "security"]);
      break;
    case "Warehouse":
    case "Industrial":
      add(["panels", "feeders", "fire-alarm"]);
      break;
    case "Retail":
    case "Commercial":
      add(["lighting", "low-voltage"]);
      break;
    default:
      break;
  }

  return SYSTEMS.filter((system) => base.includes(system.id)).map((system) => system.id);
}

export function allSystemIds() {
  return SYSTEMS.map((system) => system.id);
}

export function systemLabel(id: string) {
  return SYSTEMS.find((system) => system.id === id)?.label ?? id;
}

export function serviceLabel(id: ServiceId | "") {
  return ESTIMATING_SERVICES.find((service) => service.id === id)?.label ?? "Not selected";
}

export function deadlineLabel(id: DeadlineId) {
  return DEADLINES.find((deadline) => deadline.id === id)?.label ?? id;
}

export function breakdownLabel(id: string) {
  return QUANTITY_BREAKDOWN.find((option) => option.id === id)?.label ?? id;
}

export function generateRequestId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint32Array(12);

  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 0xffffffff);
  }

  const code = Array.from(bytes, (value) => alphabet[value % alphabet.length]).join("");
  return `IES-${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
}

export function parseArea(value: string) {
  const amount = parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export function requestedBudgetLabel(value: string, currency = "USD") {
  const amount = Number(String(value).replace(/,/g, ""));
  const selectedCurrency = CURRENCIES.includes(currency) ? currency : "USD";
  if (!String(value).trim() || !Number.isFinite(amount) || amount < 0) return "Not provided";

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: selectedCurrency,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} — requested budget, not final pricing`;
}

export function buildSummaryText(state: BidFormState, bidId?: string) {
  const line = (label: string, value: string | number | undefined | null) =>
    `${label}: ${value === undefined || value === null || value === "" ? "—" : value}`;

  const blocks: string[] = [
    "INTERNATIONAL ESTIMATING — BID REQUEST SUMMARY",
    bidId ? `Bid ID: ${bidId}` : "",
    "",
    "CLIENT & PROJECT DETAILS",
    line("Client Name", state.clientName),
    line("Company", state.companyName),
    line("Email", state.email),
    line("Phone", state.phone),
    line("Project Name", state.projectName),
    line("Project Type", state.projectType),
    line("Location", state.projectLocation),
    line("Project Area (sq ft)", parseArea(state.area) ? num.format(parseArea(state.area)) : ""),
    line("Number of Floors", state.floors),
    line("Drawing Sheets", state.sheets),
    "",
    "ESTIMATING SERVICE",
    line("Service", serviceLabel(state.service)),
    line("Client Requested Service Budget", requestedBudgetLabel(state.requestedBudget, state.requestedBudgetCurrency)),
    "",
    "SELECTED SYSTEMS",
    state.systems.length ? state.systems.map((id) => `• ${systemLabel(id)}`).join("\n") : "—",
    "",
    "DRAWING & QUANTITY REQUIREMENTS",
    line("Drawing Status", state.drawingStatus),
    line("Quantity Breakdown", state.breakdown.map(breakdownLabel).join(", ")),
    line("Preferred Deadline", deadlineLabel(state.deadline)),
    "",
    "SPECIAL CLIENT INSTRUCTIONS",
    line("Instructions", state.specialInstructions),
    "",
    "The client requested budget is not final pricing. Final fixed pricing is provided after bid, drawings, and scope review.",
  ];

  return blocks.join("\n").replace(/\n{3,}/g, "\n\n");
}
