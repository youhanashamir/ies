export const SITE = {
  name: "International Estimating",
  shortName: "IE",
  tagline: "Accurate Takeoffs. Reliable Estimates. Confident Bids.",
  description:
    "Professional electrical and MEP estimating services for contractors and construction professionals worldwide. Drawing-based quantity takeoffs, detailed cost breakdowns, and bid-ready estimates.",
  closing: "Your Project. Our Precision. Your Competitive Edge.",
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/submit-bid", label: "Submit a Project" },
  { href: "/contact", label: "Contact Us" },
];

/* ------------------------------------------------------------------ */
/* Imagery (Pexels — free to use)                                       */
/* ------------------------------------------------------------------ */
const px = (id: number, w = 1400, h = 900) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

export const IMAGES = {
  hero: {
    src: px(8482865, 1800, 1200),
    alt: "Construction estimators reviewing a blueprint on a laptop",
    credit: "Thirdman / Pexels",
  },
  blueprintsFlat: {
    src: px(5582585, 1400, 1000),
    alt: "Architectural blueprints with drawing tools laid out on a desk",
    credit: "Thirdman / Pexels",
  },
  floorPlan: {
    src: px(4458205, 1400, 1000),
    alt: "Close-up of an architectural floor plan",
    credit: "Ivan S / Pexels",
  },
  electricalPanel: {
    src: px(39639325, 1000, 1250),
    alt: "Industrial electrical control panels",
    credit: "Vjanodic WERSOV / Pexels",
  },
  wiring: {
    src: px(28265032, 1400, 1000),
    alt: "Network of electrical wiring and control panels",
    credit: "ranjeet / Pexels",
  },
  electrician: {
    src: px(29871587, 1000, 1250),
    alt: "Electrician installing wiring during a building renovation",
    credit: "Okan Yaşar / Pexels",
  },
  calculator: {
    src: px(5921494, 1000, 1250),
    alt: "Hand using a calculator for calculations on blueprints",
    credit: "RDNE Stock project / Pexels",
  },
  ductwork: {
    src: px(8297856, 1000, 1250),
    alt: "Industrial air ducts running along a ceiling",
    credit: "Mikhail Nilov / Pexels",
  },
  supplyDuct: {
    src: px(11538226, 1400, 1000),
    alt: "Air duct labelled SUPPLY in an industrial building",
    credit: "Jonathan Cooper / Pexels",
  },
  teamSite: {
    src: px(8961133, 1400, 1000),
    alt: "Engineering team analysing blueprints together on site",
    credit: "Mikael Blomkvist / Pexels",
  },
  architectSite: {
    src: px(9405517, 1400, 1000),
    alt: "Architect examining blueprints at a construction site",
    credit: "Gerzon Piñata / Pexels",
  },
  architectDesk: {
    src: px(9617369, 1400, 1000),
    alt: "Estimator working on blueprint drawings under lamp light",
    credit: "Ron Lach / Pexels",
  },
  reviewingPlans: {
    src: px(7937687, 1400, 1000),
    alt: "Professional reviewing construction plans in a modern building",
    credit: "Pavel Danilyuk / Pexels",
  },
  threeArchitects: {
    src: px(8470031, 1400, 1000),
    alt: "Three professionals in hard hats reviewing blueprints",
    credit: "Thirdman / Pexels",
  },
  highrise: {
    src: px(33719831, 1400, 1000),
    alt: "Modern high-rise building with a glass facade",
    credit: "Zulfugar Karimov / Pexels",
  },
  industrialFacade: {
    src: px(31331049, 1400, 1000),
    alt: "Modern industrial facade with red steel beams",
    credit: "Jan van der Wolf / Pexels",
  },
  dataCables: {
    src: px(15559037, 1400, 1000),
    alt: "Blue network cables in a data center",
    credit: "cnrdmroglu / Pexels",
  },
  piping: {
    src: px(36983669, 1400, 1000),
    alt: "Insulated industrial pipes running along a building exterior",
    credit: "Mariia Stepanova / Pexels",
  },
};

/* Full-width parallax title banners, one per page (Pexels). */
export const PAGE_HEROES = {
  services: { src: px(5582585, 1800, 1000), alt: "Architectural blueprints with drawing tools on a desk" },
  about: { src: px(9617369, 1800, 1000), alt: "Estimator working through blueprints under lamp light" },
  submit: { src: px(4792483, 1800, 1000), alt: "Construction floor plans with ruler and pencil on a wooden desk" },
  contact: { src: px(8482865, 1800, 1000), alt: "Estimators reviewing blueprints on a laptop" },
  policies: { src: px(27928762, 1800, 1000), alt: "Electrician working on a circuit breaker panel" },
  terms: { src: px(28169591, 1800, 1000), alt: "Copper plumbing fittings arranged in a row" },
} as const;

export type PageHeroKey = keyof typeof PAGE_HEROES;

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */
export type Service = {
  slug: string;
  index: string;
  title: string;
  short: string;
  description: string;
  detail: string;
  includes: string[];
  image: { src: string; alt: string; credit: string };
};

export const SERVICES: Service[] = [
  {
    slug: "electrical-takeoffs",
    index: "01",
    title: "Electrical Takeoffs & Counts",
    short: "Drawing-based quantities",
    description:
      "Detailed counts of electrical fixtures, devices, panels, feeders, conduit, wiring, and other components from construction drawings.",
    detail:
      "Detailed counts of lighting fixtures, receptacles, switches, fire alarm devices, panels, feeders, conduit, wiring, and other electrical components — taken directly from your construction drawings and organized the way your bid needs them.",
    includes: [
      "Lighting fixtures & lighting controls",
      "Receptacles, switches & devices",
      "Fire alarm & life-safety devices",
      "Panels, switchgear & distribution",
      "Feeders, branch wiring & conduit runs",
      "Organized counts by floor, sheet, or zone",
    ],
    image: IMAGES.electricalPanel,
  },
  {
    slug: "electrical-cost-estimating",
    index: "02",
    title: "Complete Electrical Cost Estimating",
    short: "Material, labor & bid-ready pricing",
    description:
      "Comprehensive material and labor pricing, installation costs, and itemized estimates to support competitive bidding.",
    detail:
      "Comprehensive material and labor pricing, installation costs, itemized cost breakdowns, and bid-ready electrical estimates — so you can bid with confidence and defend every line item.",
    includes: [
      "Material pricing & quantities",
      "Labor hours & installation costs",
      "Itemized cost breakdowns",
      "Scope inclusions & exclusions",
      "Bid-ready summary sheets",
      "Clear assumptions & clarifications",
    ],
    image: IMAGES.calculator,
  },
  {
    slug: "mep-estimating",
    index: "03",
    title: "Comprehensive MEP Estimating",
    short: "Mechanical · Electrical · Plumbing",
    description:
      "Quantity takeoffs and cost estimates for Mechanical, Electrical, and Plumbing systems based on project drawings and specifications.",
    detail:
      "Quantity takeoffs and cost estimates for Mechanical, Electrical, and Plumbing systems — including applicable equipment, fixtures, ductwork, piping, materials, and labor — based on project drawings and specifications.",
    includes: [
      "HVAC equipment & ductwork",
      "Plumbing fixtures & piping",
      "Electrical systems & distribution",
      "Equipment schedules & specifications",
      "Material & labor cost analysis",
      "Coordinated multi-trade summaries",
    ],
    image: IMAGES.ductwork,
  },
];

export const SPECIALIZATION =
  "Drawing-based quantity takeoffs, material and labor cost analysis, scope breakdowns, and professionally organized estimating reports tailored to project drawings and specifications.";

/* ------------------------------------------------------------------ */
/* Why choose us                                                       */
/* ------------------------------------------------------------------ */
export const REASONS = [
  {
    index: "01",
    title: "Drawing-based accuracy",
    text: "Every quantity is taken from your drawings and specifications — not assumed, not averaged. Counts you can trace back to the sheet.",
  },
  {
    index: "02",
    title: "Bid-ready deliverables",
    text: "Itemized material and labor breakdowns, organized by system, floor, or sheet, ready to drop into your proposal.",
  },
  {
    index: "03",
    title: "Confidential by default",
    text: "Your drawings, pricing, and project information stay private. We work within the agreed scope and nothing leaves the project.",
  },
  {
    index: "04",
    title: "Deadline-driven",
    text: "Flexible, standard, or urgent — choose the turnaround that fits your bid date and we deliver without compromising quality.",
  },
];

/* ------------------------------------------------------------------ */
/* Process                                                             */
/* ------------------------------------------------------------------ */
export const PROCESS = [
  {
    index: "01",
    title: "Send drawings & scope",
    text: "Share your project drawings, specifications, and scope requirements through the bid form or a direct message.",
  },
  {
    index: "02",
    title: "Scope review & fee",
    text: "We review the sheets, confirm inclusions and exclusions, and agree on the fee, format, and deadline before work begins.",
  },
  {
    index: "03",
    title: "Takeoff & counts",
    text: "Fixtures, devices, panels, feeders, conduit, ductwork, and piping are counted and measured sheet by sheet.",
  },
  {
    index: "04",
    title: "Pricing & labor",
    text: "Material pricing and labor hours are applied and organized into clear, itemized cost breakdowns.",
  },
  {
    index: "05",
    title: "Delivery & support",
    text: "You receive a professionally organized estimate with assumptions documented — and support for addenda or revisions.",
  },
];

/* ------------------------------------------------------------------ */
/* Company policies / principles                                       */
/* ------------------------------------------------------------------ */
export const POLICIES = [
  {
    index: "01",
    title: "Accuracy & Quality",
    text: "We prioritize accuracy, quality, and attention to detail in every estimate.",
  },
  {
    index: "02",
    title: "Safety & Compliance",
    text: "Safety is our priority. We respect applicable project safety requirements, codes, and standards within the agreed estimating scope.",
  },
  {
    index: "03",
    title: "Confidentiality",
    text: "Client drawings and project information remain confidential.",
  },
  {
    index: "04",
    title: "Transparency",
    text: "We clearly communicate scope, assumptions, exclusions, pricing, and project timelines.",
  },
  {
    index: "05",
    title: "Timely Delivery",
    text: "We strive to meet agreed deadlines without compromising quality.",
  },
  {
    index: "06",
    title: "Client Satisfaction",
    text: "We value clear communication, professional support, and client feedback.",
  },
  {
    index: "07",
    title: "Fair Pricing",
    text: "Our service fees and payment terms are agreed upon before work begins.",
  },
];

/* ------------------------------------------------------------------ */
/* Systems, sectors, options                                           */
/* ------------------------------------------------------------------ */
export type SystemGroup = "electrical" | "mechanical" | "plumbing" | "other";

export const SYSTEMS: { id: string; label: string; group: SystemGroup }[] = [
  { id: "lighting", label: "Lighting & Lighting Controls", group: "electrical" },
  { id: "power", label: "Power & Receptacles", group: "electrical" },
  { id: "panels", label: "Panels & Switchgear", group: "electrical" },
  { id: "feeders", label: "Feeders, Wiring & Conduit", group: "electrical" },
  { id: "fire-alarm", label: "Fire Alarm & Life Safety", group: "electrical" },
  { id: "low-voltage", label: "Low Voltage & Telecommunications", group: "electrical" },
  { id: "security", label: "Security / CCTV / Access Control", group: "electrical" },
  { id: "mechanical", label: "Mechanical / HVAC", group: "mechanical" },
  { id: "plumbing", label: "Plumbing & Piping", group: "plumbing" },
  { id: "other", label: "Other / Custom Scope", group: "other" },
];

export const PROJECT_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Warehouse",
  "Healthcare",
  "Educational",
  "Retail",
  "Data Center",
  "Other",
] as const;

export const SECTORS = [
  { name: "Residential", note: "Multi-family, custom homes & renovations" },
  { name: "Commercial", note: "Offices, mixed-use & tenant fit-outs" },
  { name: "Industrial", note: "Plants, process facilities & utilities" },
  { name: "Warehouse", note: "Distribution & logistics facilities" },
  { name: "Healthcare", note: "Hospitals, clinics & medical offices" },
  { name: "Educational", note: "Schools, campuses & training centers" },
  { name: "Retail", note: "Stores, showrooms & restaurants" },
  { name: "Data Center", note: "Critical power & low-voltage systems" },
];

export const ESTIMATING_SERVICES = [
  {
    id: "takeoff",
    label: "Quantity Takeoff / Counting Only",
    note: "Counts and quantities from drawings — no pricing.",
  },
  {
    id: "electrical",
    label: "Complete Electrical Estimate",
    note: "Quantities plus material, labor, and itemized pricing.",
  },
  {
    id: "mep",
    label: "Complete MEP Estimate",
    note: "Mechanical, electrical, and plumbing quantities and costs.",
  },
] as const;

export const DRAWING_STATUS = [
  "Complete Drawings",
  "Partial Drawings",
  "Preliminary Drawings",
  "Drawings Under Development",
] as const;

export const QUANTITY_BREAKDOWN = [
  { id: "combined", label: "Combined Estimate", note: "Complete project estimate in one summary." },
  { id: "floor-wise", label: "Floor-Wise", note: "Separate estimate for each floor." },
  { id: "sheet-wise", label: "Sheet-Wise", note: "Estimate organized by drawing sheet." },
  { id: "system-tabs", label: "System Tabs", note: "Separate tabs for Lighting, Power, Panels, Fire Alarm, etc." },
  { id: "custom", label: "Custom Breakdown", note: "User-defined estimate format based on project requirements." },
] as const;

export type QuantityBreakdownId = (typeof QUANTITY_BREAKDOWN)[number]["id"];

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */
export const FAQS = [
  {
    q: "What do you need from me to start an estimate?",
    a: "Your project drawings (PDF or CAD), specifications if available, the scope you want covered, and your bid deadline. The Submit a Project form walks you through everything we need.",
  },
  {
    q: "How is the estimating fee calculated?",
    a: "You can share a requested service budget with your bid. It is not a quotation. We review the drawings, selected scope, and delivery requirements before confirming the final fixed fee and payment terms."
  },
  {
    q: "What format will my estimate be delivered in?",
    a: "Professionally organized spreadsheets and summary reports, broken down by system, floor, sheet, or zone — whichever structure suits your bid. Marked-up drawings can be included on request.",
  },
  {
    q: "Can you handle urgent bid deadlines?",
    a: "Yes. Choose the Urgent turnaround when submitting your project and we will confirm feasibility right away. Urgent work is prioritized without compromising accuracy.",
  },
  {
    q: "Are my drawings and pricing kept confidential?",
    a: "Always. Client drawings, pricing, and project information remain confidential and are used only for the agreed estimating scope.",
  },
];
