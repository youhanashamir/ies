/**
 * Search-focused content for the individual service pages (/services/[slug]).
 * Each page targets one primary US search phrase plus close variants, and every
 * FAQ here is rendered on the page (FAQ structured data must match visible text).
 */
export type ServicePage = {
  slug: string;
  /** <title>, ~60 characters, primary keyword first. */
  metaTitle: string;
  /** Search snippet, ~150 characters. */
  metaDescription: string;
  keywords: string[];
  eyebrow: string;
  h1: string;
  intro: string;
  audienceTitle: string;
  audience: { title: string; text: string }[];
  deliverablesTitle: string;
  deliverables: string[];
  faqs: { q: string; a: string }[];
};

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: "electrical-takeoffs",
    metaTitle: "Electrical Takeoff Services for US Contractors",
    metaDescription:
      "Accurate electrical takeoff services from your PDF plans: lighting, devices, panels, feeders, conduit and wire counts, organized by floor or sheet for your bid.",
    keywords: [
      "electrical takeoff services",
      "electrical takeoffs",
      "electrical material takeoff",
      "electrical quantity takeoff",
      "lighting fixture count",
      "conduit and wire takeoff",
      "low voltage takeoff",
      "fire alarm takeoff",
      "outsource electrical takeoff",
    ],
    eyebrow: "Electrical takeoff services",
    h1: "Electrical takeoff services for contractors across the US",
    intro:
      "Send us your plans and get back a clean, sheet-by-sheet electrical material takeoff: every fixture, device, panel, feeder, and conduit run counted and measured, then organized the way you price your bids. You keep your own pricing and labor units; we handle the counting.",
    audienceTitle: "Built for electrical contractors who bid often",
    audience: [
      { title: "Electrical contractors", text: "Free up your estimators for pricing and strategy while we produce the quantities for every bid on your list." },
      { title: "General contractors", text: "Check electrical sub bids against independent quantities before you award the work." },
      { title: "Suppliers & distributors", text: "Build accurate material quotes for lighting packages, gear, and wire from the same drawings your customers bid." },
    ],
    deliverablesTitle: "What your electrical takeoff includes",
    deliverables: [
      "Lighting fixture counts by type, with lighting controls",
      "Receptacles, switches, and wiring devices",
      "Panels, switchboards, transformers, and disconnects",
      "Feeder and branch circuit lengths, conduit, and wire",
      "Fire alarm, low voltage, data, and security devices",
      "Spreadsheet takeoff organized by floor, sheet, or zone",
    ],
    faqs: [
      {
        q: "What is an electrical takeoff?",
        a: "An electrical takeoff is a detailed count and measurement of every electrical item on a set of construction drawings: fixtures, devices, panels, feeders, conduit, and wire. Contractors apply their own material prices and labor units to the takeoff to build a bid.",
      },
      {
        q: "What drawings do you need for an electrical takeoff?",
        a: "PDF electrical plans are required, and the full drawing set with specifications, fixture schedules, and panel schedules gives the most complete result. Upload them through the Submit a Project form.",
      },
      {
        q: "Can the takeoff be split by floor or area?",
        a: "Yes. Quantities can be organized as one combined takeoff or broken out floor by floor, sheet by sheet, or by zone, whichever matches how you price and phase the job.",
      },
      {
        q: "Do you also price the electrical takeoff?",
        a: "If you need pricing as well, choose our complete electrical cost estimating service, which adds material pricing, labor hours, and a bid-ready summary on top of the quantities.",
      },
    ],
  },
  {
    slug: "electrical-cost-estimating",
    metaTitle: "Electrical Estimating Services | Bid-Ready Estimates",
    metaDescription:
      "Outsourced electrical estimating services for US contractors: quantities, material pricing, labor hours, and itemized, bid-ready electrical estimates from your plans.",
    keywords: [
      "electrical estimating services",
      "electrical estimating",
      "electrical cost estimating",
      "electrical estimator",
      "outsourced electrical estimating",
      "electrical bid estimate",
      "commercial electrical estimating",
      "residential electrical estimating",
      "electrical labor estimate",
    ],
    eyebrow: "Electrical estimating services",
    h1: "Electrical estimating services that get your bids out on time",
    intro:
      "Our electrical estimators turn your drawings into a complete, itemized electrical estimate: quantities, material pricing, labor hours, and installation costs, with scope inclusions, exclusions, and assumptions written out. You get a bid-ready number you can review, adjust, and defend line by line.",
    audienceTitle: "An outsourced electrical estimator on your team",
    audience: [
      { title: "Electrical contractors", text: "Bid more projects without hiring another full-time estimator. Send plans when your bid list gets heavy." },
      { title: "Commercial & industrial bids", text: "Offices, retail, healthcare, schools, warehouses, plants, and data centers, with each system broken out." },
      { title: "Residential & multifamily", text: "Custom homes, renovations, and multi-family buildings estimated unit by unit or floor by floor." },
    ],
    deliverablesTitle: "What your electrical estimate includes",
    deliverables: [
      "Complete electrical quantity takeoff",
      "Material pricing for every line item",
      "Labor hours and installation costs",
      "Itemized cost breakdown by system and area",
      "Scope inclusions, exclusions, and clarifications",
      "Bid-ready summary sheet for your proposal",
    ],
    faqs: [
      {
        q: "What do electrical estimating services include?",
        a: "A full electrical estimate covers the quantity takeoff, material pricing, labor hours, and installation costs, organized into an itemized breakdown with a bid summary. Scope assumptions, inclusions, and exclusions are documented so you can review the basis of the number.",
      },
      {
        q: "Why outsource electrical estimating?",
        a: "Outsourcing lets you bid more projects without adding full-time estimating staff. Your team stays focused on winning and running work while we prepare the takeoffs and estimates for the jobs on your bid list.",
      },
      {
        q: "How is the estimating fee set?",
        a: "You can share a requested budget when you submit your project. We review the drawings, scope, and deadline, then confirm a fixed fee and payment terms before any work begins.",
      },
      {
        q: "Do you estimate both commercial and residential electrical work?",
        a: "Yes. We estimate commercial, industrial, healthcare, educational, retail, warehouse, data center, and residential projects, including multi-family buildings.",
      },
    ],
  },
  {
    slug: "mep-estimating",
    metaTitle: "MEP Estimating Services | Mechanical, Electrical & Plumbing",
    metaDescription:
      "MEP estimating services for US contractors: HVAC, plumbing, and electrical takeoffs and cost estimates from your drawings, coordinated in one bid-ready report.",
    keywords: [
      "MEP estimating services",
      "MEP estimating",
      "MEP takeoff services",
      "mechanical estimating services",
      "HVAC estimating services",
      "plumbing estimating services",
      "MEP cost estimate",
      "HVAC takeoff",
      "plumbing takeoff",
    ],
    eyebrow: "MEP estimating services",
    h1: "MEP estimating services for mechanical, electrical, and plumbing bids",
    intro:
      "Get mechanical, electrical, and plumbing takeoffs and cost estimates from one estimating team. HVAC equipment and ductwork, plumbing fixtures and piping, and electrical distribution are quantified from the same drawing set and delivered as coordinated, trade-by-trade summaries.",
    audienceTitle: "One estimating team for every MEP trade",
    audience: [
      { title: "MEP & mechanical contractors", text: "HVAC, plumbing, and electrical estimates prepared together so nothing falls between trades." },
      { title: "General contractors", text: "Independent MEP numbers to level subcontractor bids and check scope gaps before buyout." },
      { title: "Developers & owners", text: "Early MEP cost estimates to test budgets as the design develops." },
    ],
    deliverablesTitle: "What your MEP estimate includes",
    deliverables: [
      "HVAC equipment, ductwork, and air devices",
      "Plumbing fixtures, piping, and equipment",
      "Electrical systems and power distribution",
      "Equipment schedules and specification review",
      "Material and labor cost analysis per trade",
      "Coordinated multi-trade summary report",
    ],
    faqs: [
      {
        q: "What does MEP estimating cover?",
        a: "MEP estimating covers the mechanical (HVAC), electrical, and plumbing systems of a building: equipment, ductwork, piping, fixtures, wiring, and the labor to install them. We deliver quantities and costs for each trade plus a combined summary.",
      },
      {
        q: "Can I order only HVAC or only plumbing?",
        a: "Yes. Select only the systems you need on the Submit a Project form, such as HVAC only, plumbing only, or electrical only, and the estimate is scoped to those trades.",
      },
      {
        q: "What drawings do you need for an MEP estimate?",
        a: "PDF mechanical, electrical, and plumbing plans with equipment schedules and specifications. Architectural plans help us confirm areas, ceiling heights, and routing.",
      },
      {
        q: "Do you work on commercial MEP projects?",
        a: "Yes. We estimate MEP systems for offices, retail, healthcare, schools, warehouses, industrial facilities, data centers, and multi-family residential buildings.",
      },
    ],
  },
];

export const servicePage = (slug: string) => SERVICE_PAGES.find((page) => page.slug === slug);
