import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import CtaBand from "@/components/home/CtaBand";
import Photo from "@/components/ui/Photo";
import SectionHeading from "@/components/ui/SectionHeading";
import { IMAGES, PAGE_HEROES, POLICIES, SERVICES, SPECIALIZATION } from "@/lib/content";
import PageHero from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "International Estimating provides professional electrical takeoffs, complete electrical cost estimating, and MEP estimating services worldwide — accurate, drawing-based quantities and detailed cost breakdowns.",
};

const STATS = [
  { value: "3", label: "Core estimating services" },
  { value: "10", label: "Building systems quantified" },
  { value: "8+", label: "Project sectors covered" },
  { value: "24/7", label: "Worldwide, remote delivery" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About International Estimating"
        title={<>The numbers behind <span className="serif-accent !text-[#e4dcff]">competitive bids.</span></>}
        description="International Estimating provides professional electrical takeoffs, complete electrical cost estimating, and MEP estimating services worldwide. We deliver accurate, drawing-based quantities and detailed cost breakdowns to help contractors prepare competitive bids."
        image={PAGE_HEROES.about.src}
        alt={PAGE_HEROES.about.alt}
      />

      {/* Imagery + stats */}
      <section className="pb-24 md:pb-32">
        <div className="container-ie">
          <div className="reveal-scale grid gap-4 md:grid-cols-12">
            <Photo
              src={IMAGES.architectSite.src}
              alt={IMAGES.architectSite.alt}
              credit={IMAGES.architectSite.credit}
              className="h-[300px] md:col-span-8 md:h-[520px]"
              sizes="(max-width: 768px) 100vw, 66vw"
              caption="Drawing-based, every time"
            />
            <div className="grid grid-cols-2 gap-4 md:col-span-4 md:grid-cols-1">
              <Photo
                src={IMAGES.architectDesk.src}
                alt={IMAGES.architectDesk.alt}
                credit={IMAGES.architectDesk.credit}
                className="h-[200px] md:h-[252px]"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <Photo
                src={IMAGES.threeArchitects.src}
                alt={IMAGES.threeArchitects.alt}
                credit={IMAGES.threeArchitects.credit}
                className="h-[200px] md:h-[252px]"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          </div>

          <div className="hairline-t mt-14 grid grid-cols-2 gap-8 pt-8 md:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={s.label} className="reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                <p className="mono-num font-display text-[40px] font-bold leading-none tracking-tight md:text-[52px]">
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="hairline-t py-20 md:py-28">
        <div className="container-ie grid gap-12 lg:grid-cols-12">
          <div className="reveal-left lg:col-span-5">
            <p className="eyebrow eyebrow-dot mb-5">What we do</p>
            <h2 className="display-h2 text-balance">
              Three services. <span className="serif-accent">One standard</span> of precision.
            </h2>
            <p className="mt-6 text-pretty text-muted">
              <span className="font-semibold text-ink">Our specialization:</span> {SPECIALIZATION}
            </p>
            <Link href="/services" className="btn-ghost mt-8">
              Explore services <ArrowRight size={14} />
            </Link>
          </div>
          <div className="lg:col-span-7">
            <div className="divide-y divide-line border-y hairline">
              {SERVICES.map((s, i) => (
                <Link
                  key={s.slug}
                  href={`/services#${s.slug}`}
                  className="reveal group grid grid-cols-[48px_1fr_auto] items-start gap-4 py-7 md:grid-cols-[72px_1fr_auto]"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <span className="eyebrow pt-2">{s.index}</span>
                  <div>
                    <p className="font-display text-[20px] font-bold tracking-tight md:text-[24px]">{s.title}</p>
                    <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">{s.detail}</p>
                  </div>
                  <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border hairline transition-colors group-hover:bg-ink group-hover:text-bg">
                    <ArrowUpRight size={15} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Company policies */}
      <section id="policies" className="hairline-t py-20 md:py-28">
        <div className="container-ie">
          <SectionHeading
            eyebrow="Company policies"
            title={
              <>
                How we work — <span className="serif-accent">clearly stated</span>, consistently kept.
              </>
            }
            description="Seven commitments that apply to every project, from a quick takeoff to a complete MEP estimate."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {POLICIES.map((p, i) => (
              <div key={p.index} className="reveal" style={{ transitionDelay: `${(i % 3) * 70}ms` }}>
                <div className="card-surface tilt-hover flex h-full flex-col gap-4 p-8">
                  <span className="eyebrow">Policy {p.index}</span>
                  <p className="font-display text-[22px] font-bold tracking-tight">{p.title}</p>
                  <p className="text-[15.5px] leading-relaxed text-muted">{p.text}</p>
                </div>
              </div>
            ))}
            <div className="reveal" style={{ transitionDelay: "140ms" }}>
              <Photo
                src={IMAGES.reviewingPlans.src}
                alt={IMAGES.reviewingPlans.alt}
                credit={IMAGES.reviewingPlans.credit}
                className="h-full min-h-[260px]"
                sizes="(max-width: 768px) 100vw, 33vw"
                caption="Transparent scope, every time"
              />
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        title="Ready for your next bid?"
        text="Send us your project drawings and scope requirements to get started. Fees and payment terms are agreed before work begins."
      />
    </>
  );
}
