import type { Metadata, MetadataRoute } from "next";
import { CONTACT_EMAIL } from "@/lib/contact";
import { FAQS, SECTORS, SERVICES, SITE, type Service } from "@/lib/content";
import { SERVICE_PAGES, type ServicePage } from "@/lib/service-pages";

/**
 * Canonical origin of the production site, without a trailing slash.
 *
 * Set NEXT_PUBLIC_SITE_URL (e.g. https://www.example.com) in the deployment
 * environment. On Vercel the production domain is picked up automatically.
 */
function resolveSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    "https://internationalestimatingservice.com";
  const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

export const SITE_URL = resolveSiteUrl();

export const absoluteUrl = (path = "/") => new URL(path, `${SITE_URL}/`).toString();

/** Every indexable page. Drives the sitemap; keep in sync when adding routes. */
export const INDEXED_ROUTES: {
  path: string;
  name: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}[] = [
  { path: "/", name: "Home", changeFrequency: "weekly", priority: 1 },
  { path: "/services", name: "Services", changeFrequency: "monthly", priority: 0.9 },
  ...SERVICE_PAGES.map((page) => ({
    path: `/services/${page.slug}`,
    name: page.eyebrow.replace(/^./, (c) => c.toUpperCase()),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  })),
  { path: "/submit-bid", name: "Submit a Project", changeFrequency: "monthly", priority: 0.9 },
  { path: "/about", name: "About Us", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", name: "Contact Us", changeFrequency: "monthly", priority: 0.8 },
  { path: "/policies", name: "Company Policies", changeFrequency: "yearly", priority: 0.4 },
  { path: "/terms", name: "Terms of Service", changeFrequency: "yearly", priority: 0.3 },
];

export const OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: `${SITE.name} — ${SITE.tagline}`,
};

/**
 * Per-page metadata with a canonical URL and complete Open Graph / Twitter
 * tags. Child `openGraph` objects replace the parent's entirely, so every
 * page builds the full set here instead of relying on the root layout.
 */
export function pageMetadata({
  title,
  description,
  path,
  keywords,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  /** Use the title as-is instead of applying the "%s — Site" template. */
  absoluteTitle?: boolean;
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} — ${SITE.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE.name,
      url: path,
      title: fullTitle,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

/* ------------------------------------------------------------------ */
/* Structured data (JSON-LD)                                            */
/* ------------------------------------------------------------------ */

const ORG_ID = `${SITE_URL}/#organization`;
/** Primary market first; work is delivered remotely, so worldwide clients are served too. */
const AREA_SERVED = [
  { "@type": "Country", name: "United States" },
  { "@type": "Country", name: "Canada" },
  "Worldwide",
];
const WEBSITE_ID = `${SITE_URL}/#website`;

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": ORG_ID,
        name: SITE.name,
        alternateName: "International Estimating Services",
        url: absoluteUrl("/"),
        logo: absoluteUrl("/logo.png"),
        image: absoluteUrl("/og-image.png"),
        description: SITE.description,
        slogan: SITE.tagline,
        email: CONTACT_EMAIL,
        areaServed: AREA_SERVED,
        knowsAbout: [
          "Electrical estimating",
          "Electrical takeoffs",
          "MEP estimating",
          "Quantity takeoff",
          "Construction cost estimating",
          "HVAC estimating",
          "Plumbing estimating",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: CONTACT_EMAIL,
          availableLanguage: ["English"],
          areaServed: AREA_SERVED,
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Estimating services",
          itemListElement: SERVICES.map((s) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: s.title,
              description: s.description,
              url: absoluteUrl(`/services/${s.slug}`),
            },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: absoluteUrl("/"),
        name: SITE.name,
        description: SITE.description,
        inLanguage: "en-US",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

export function breadcrumbJsonLd(path: string) {
  // Each path segment becomes a crumb: /services/mep-estimating -> Home > Services > MEP estimating.
  const segments = path.split("/").filter(Boolean);
  const crumbs = [{ name: "Home", path: "/" }];
  segments.forEach((_, i) => {
    const crumbPath = `/${segments.slice(0, i + 1).join("/")}`;
    crumbs.push({ name: INDEXED_ROUTES.find((r) => r.path === crumbPath)?.name ?? crumbPath, path: crumbPath });
  });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** Service, FAQ, and breadcrumb data for one /services/[slug] page. */
export function serviceJsonLd(page: ServicePage, service: Service) {
  const url = absoluteUrl(`/services/${page.slug}`);
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${url}#service`,
      name: service.title,
      serviceType: page.eyebrow,
      description: page.metaDescription,
      url,
      provider: { "@id": ORG_ID },
      areaServed: AREA_SERVED,
      audience: { "@type": "BusinessAudience", audienceType: "Contractors" },
      category: SECTORS.map((sector) => sector.name),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    breadcrumbJsonLd(`/services/${page.slug}`),
  ];
}

export function servicesJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Estimating services",
    itemListElement: SERVICES.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.title,
        description: s.detail,
        serviceType: s.title,
        url: absoluteUrl(`/services/${s.slug}`),
        areaServed: AREA_SERVED,
        provider: { "@id": ORG_ID },
      },
    })),
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
