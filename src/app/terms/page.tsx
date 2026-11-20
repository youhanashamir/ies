import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PAGE_HEROES } from "@/lib/content";
import PageHero from "@/components/ui/PageHero";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "Service terms for International Estimating: estimating scope, pricing and payment, assumptions and exclusions, confidentiality of drawings, delivery timing, and client review.",
  path: "/terms",
});

const TERMS = [
  {
    title: "Estimating scope",
    text: "Estimating services are based on the drawings, specifications, systems, inclusions, exclusions, and delivery requirements agreed with the client before work begins.",
  },
  {
    title: "Pricing & payment terms",
    text: "Service fees and payment terms are agreed upon before work begins. Any budget submitted by a client is a request only and is not an official quotation. Final fixed pricing is provided after review of the bid, drawings, and scope."
  },
  {
    title: "Assumptions & exclusions",
    text: "Scope assumptions, exclusions, and any relevant clarifications are communicated as part of the estimating deliverable so the client can review the basis of the estimate.",
  },
  {
    title: "Drawings & project information",
    text: "Client drawings and project information remain confidential and are used only for the agreed estimating scope.",
  },
  {
    title: "Delivery timing",
    text: "We strive to meet agreed delivery deadlines without compromising quality. Any project changes, incomplete drawings, or new information may require a scope and schedule review.",
  },
  {
    title: "Client review",
    text: "Clients are responsible for reviewing delivered quantities, cost breakdowns, assumptions, and exclusions in relation to their final bid and project requirements.",
  },
];

export default function TermsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("/terms")} />
      <PageHero
        eyebrow="International Estimating"
        title={<>Service <span className="serif-accent !text-[#e4dcff]">Terms.</span></>}
        description="A straightforward summary of how project estimating requests, scope, fees, delivery, and confidentiality are handled."
        image={PAGE_HEROES.terms.src}
        alt={PAGE_HEROES.terms.alt}
      />

      <section className="py-20 md:py-28">
        <div className="container-ie max-w-5xl">
          <div className="border-t hairline">
            {TERMS.map((term, index) => (
              <article key={term.title} className="reveal grid gap-4 border-b hairline py-8 md:grid-cols-[100px_1fr] md:gap-8 md:py-10" style={{ transitionDelay: `${index * 45}ms` }}>
                <span className="mono-num text-sm font-semibold text-accent-ink">0{index + 1}</span>
                <div>
                  <h2 className="font-display text-[24px] font-bold tracking-tight">{term.title}</h2>
                  <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">{term.text}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/contact" className="btn-primary">
              Contact Us <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
