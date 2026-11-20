import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { CircleAlert, FileText, ShieldCheck } from "lucide-react";
import BidForm from "@/components/bid/BidForm";
import PageHero from "@/components/ui/PageHero";
import { PAGE_HEROES } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Submit Plans for an Electrical or MEP Estimate",
  description:
    "Upload your PDF plans, choose electrical takeoff, electrical estimating, or MEP estimating, and set your bid deadline. We confirm a fixed fee before work begins.",
  path: "/submit-bid",
});

export default function SubmitProjectPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd("/submit-bid")} />
      <PageHero
        eyebrow="International Estimating · Submit a Project"
        title={<>Submit your project for review.</>}
        description="Upload the working plans, define the systems you need estimated, and provide your requested service budget. We review the full scope before confirming final fixed pricing."
        image={PAGE_HEROES.submit.src}
        alt={PAGE_HEROES.submit.alt}
      >
        <div className="max-w-2xl border hairline border-l-4 border-l-[#6B3DF4] bg-white p-4 text-[13.5px] leading-relaxed text-ink shadow-sm">
          <div className="flex items-start gap-3"><CircleAlert size={18} className="mt-0.5 flex-none text-accent-ink" /><p><strong>Important:</strong> PDF plans and a requested budget are required. Your requested budget is not a quote; final fixed pricing is provided after our bid, drawings, and scope review.</p></div>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-[12px] text-white/75">
          <span className="inline-flex items-center gap-2"><FileText size={14} className="text-[#e4dcff]" />PDF plans required</span>
          <span className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-[#e4dcff]" />Field-level validation</span>
          <span>Final pricing after review</span>
        </div>
      </PageHero>

      <section className="bg-bg py-10 md:py-14">
        <div className="container-ie">
          <BidForm />
        </div>
      </section>
    </>
  );
}
