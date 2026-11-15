import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RevealManager from "@/components/ui/RevealManager";
import InitialLoader from "@/components/ui/InitialLoader";
import SmoothScroll from "@/components/ui/SmoothScroll";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — Electrical & MEP Estimating Services`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "electrical estimating",
    "MEP estimating",
    "electrical takeoff",
    "quantity takeoff services",
    "construction cost estimating",
    "electrical bid estimate",
    "International Estimating",
  ],
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    type: "website",
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
  icons: { icon: "/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#faf9ff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
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
