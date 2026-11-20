import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RevealManager from "@/components/ui/RevealManager";
import InitialLoader from "@/components/ui/InitialLoader";
import SmoothScroll from "@/components/ui/SmoothScroll";
import { SITE } from "@/lib/content";
import JsonLd from "@/components/seo/JsonLd";
import { OG_IMAGE, SITE_URL, siteJsonLd } from "@/lib/seo";

const verification: Metadata["verification"] = {
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : {}),
  ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
    ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } }
    : {}),
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Electrical & MEP Estimating Services for US Contractors",
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "Construction",
  keywords: [
    "electrical estimating services",
    "electrical estimating services USA",
    "electrical takeoff services",
    "MEP estimating services",
    "electrical estimator",
    "outsourced electrical estimating",
    "electrical cost estimating",
    "electrical material takeoff",
    "commercial electrical estimating",
    "residential electrical estimating",
    "MEP takeoff services",
    "HVAC estimating services",
    "plumbing estimating services",
    "construction estimating services",
    "quantity takeoff services",
    "electrical bid estimate",
    "International Estimating",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE.name,
    url: "/",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { email: false, address: false, telephone: false },
  verification,
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "160x160" }],
    apple: "/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf9ff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-US">
      <body className="antialiased">
        <JsonLd data={siteJsonLd()} />
        <InitialLoader />
        <SmoothScroll />
        <Header />
        <main>{children}</main>
        <Footer />
        <RevealManager />
      </body>
    </html>
  );
}
