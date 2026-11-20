import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PAGE_HEROES, POLICIES } from "@/lib/content";
import PageHero from "@/components/ui/PageHero";

export const metadata: Metadata = pageMetadata({
  title: "Company Policies",
  description:
    "International Estimating company policies: accuracy, safety, confidentiality, transparency, timely delivery, client satisfaction, and fair pricing.",
  path: "/policies",
});

export default function PoliciesPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("/policies")} />
      <PageHero
        eyebrow="International Estimating"
        title={<>Company <span className="serif-accent !text-[#e4dcff]">Policies.</span></>}
        description="Clear principles for accurate work, confidential project handling, transparent scope, fair pricing, and dependable delivery."
        image={PAGE_HEROES.policies.src}
        alt={PAGE_HEROES.policies.alt}
      />

      <section className="py-20 md:py-28">
        <div className="container-ie max-w-5xl">
          <div className="border-t hairline">
            {POLICIES.map((policy, index) => (
              <article key={policy.index} className="reveal grid gap-4 border-b hairline py-8 md:grid-cols-[100px_1fr] md:gap-8 md:py-10" style={{ transitionDelay: `${index * 45}ms` }}>
                <span className="mono-num text-sm font-semibold text-accent-ink">{policy.index}</span>
                <div>
                  <h2 className="font-display text-[24px] font-bold tracking-tight">{policy.title}</h2>
                  <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">{policy.text}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/submit-bid" className="btn-primary">
              Submit a Project <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
