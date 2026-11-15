import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import CtaBand from "@/components/home/CtaBand";
import Photo from "@/components/ui/Photo";
import SectionHeading from "@/components/ui/SectionHeading";
import Marquee from "@/components/ui/Marquee";
import { IMAGES, PAGE_HEROES, PROCESS, QUANTITY_BREAKDOWN, SERVICES, SPECIALIZATION, SYSTEMS } from "@/lib/content";
import PageHero from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Services & Specializations",
  description:
    "Electrical takeoffs & counts, complete electrical cost estimating, and comprehensive MEP estimating — drawing-based quantities and bid-ready cost breakdowns for contractors worldwide.",
};

const GROUPS: { key: string; label: string; ids: string[] }[] = [
  { key: "electrical", label: "Electrical", ids: SYSTEMS.filter((s) => s.group === "electrical").map((s) => s.id) },
  { key: "mechanical", label: "Mechanical", ids: SYSTEMS.filter((s) => s.group === "mechanical").map((s) => s.id) },
  { key: "plumbing", label: "Plumbing", ids: SYSTEMS.filter((s) => s.group === "plumbing").map((s) => s.id) },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our services & specializations"
        title={<>Counted. Priced. <span className="serif-accent !text-[#e4dcff]">Bid-ready.</span></>}
        description="Three focused estimating services covering the full bid workflow — from drawing-based quantity takeoffs to complete electrical and MEP cost estimates, organized exactly the way your proposal needs them."
        image={PAGE_HEROES.services.src}
        alt={PAGE_HEROES.services.alt}
      />

      {/* Services detail */}
      <section className="hairline-t">
        {SERVICES.map((s, i) => (
          <article
            key={s.slug}
            id={s.slug}
            className={`scroll-mt-24 py-20 md:py-28 ${i !== 0 ? "hairline-t" : ""}`}
          >
            <div className="container-ie grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
              <div className={`${i % 2 === 1 ? "lg:order-2" : ""} reveal-left lg:col-span-5`}>
                <Photo
                  src={s.image.src}
                  alt={s.image.alt}
                  credit={s.image.credit}
                  className="h-[340px] md:h-[520px]"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  caption={s.short}
                />
              </div>
              <div className={`${i % 2 === 1 ? "lg:order-1" : ""} reveal-right lg:col-span-7`}>
                <span className="eyebrow">Service {s.index}</span>
                <h2 className="display-h2 mt-4 text-balance">{s.title}</h2>
                <p className="mt-6 max-w-2xl text-pretty text-muted">{s.detail}</p>
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {s.includes.map((item) => (
                    <li key={item} className="flex items-start gap-3 rounded-2xl border hairline bg-surface px-4 py-3 text-[14.5px]">
                      <Check size={15} className="mt-1 flex-none text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/submit-bid" className="btn-primary">
                    Request this service <ArrowUpRight size={15} />
                  </Link>
                  <Link href="/contact" className="btn-ghost">
                    Ask about scope
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Specialization */}
      <section className="hairline-t py-20 md:py-28">
        <div className="container-ie">
          <div className="reveal-scale card-surface soft-shadow grid gap-10 overflow-hidden p-8 md:grid-cols-12 md:p-12">
            <div className="md:col-span-7">
              <p className="eyebrow eyebrow-dot mb-5">Our specialization</p>
              <h2 className="display-h3 text-balance">
                Drawing-based takeoffs, cost analysis, and <span className="serif-accent">organized reports</span>{" "}
                tailored to your project.
              </h2>
              <p className="mt-5 max-w-2xl text-pretty text-muted">{SPECIALIZATION}</p>
              <div className="mt-8">
                <p className="field-label">Quantity breakdown formats</p>
                <div className="flex flex-wrap gap-2">
                  {QUANTITY_BREAKDOWN.map((q) => (
                    <span key={q.id} className="rounded-full border hairline px-3 py-1.5 text-[13px]">
                      {q.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="md:col-span-5">
              <Photo
                src={IMAGES.floorPlan.src}
                alt={IMAGES.floorPlan.alt}
                credit={IMAGES.floorPlan.credit}
                className="h-[260px] md:h-full md:min-h-[340px]"
                sizes="(max-width: 768px) 100vw, 35vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Systems coverage */}
      <section className="hairline-t py-20 md:py-28">
        <div className="container-ie">
          <SectionHeading
            eyebrow="Systems coverage"
            title={
              <>
                Every system, <span className="serif-accent">one coordinated</span> estimate.
              </>
            }
            description="Select only the systems you need, or let us auto-select a scope based on your service and project type when you submit a project."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {GROUPS.map((g, gi) => (
              <div key={g.key} className="reveal" style={{ transitionDelay: `${gi * 80}ms` }}>
                <div className="card-surface h-full p-7">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-xl font-bold tracking-tight">{g.label}</p>
                    <span className="eyebrow">{g.ids.length} systems</span>
                  </div>
                  <ul className="mt-5 space-y-2.5">
                    {g.ids.map((id) => (
                      <li key={id} className="flex items-start gap-2.5 text-[14.5px]">
                        <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                        {SYSTEMS.find((s) => s.id === id)?.label}
                      </li>
                    ))}
                  </ul>
                  {g.key === "mechanical" && (
                    <Photo
                      src={IMAGES.supplyDuct.src}
                      alt={IMAGES.supplyDuct.alt}
                      credit={IMAGES.supplyDuct.credit}
                      className="mt-6 h-[170px]"
                      sizes="33vw"
                    />
                  )}
                  {g.key === "plumbing" && (
                    <Photo
                      src={IMAGES.piping.src}
                      alt={IMAGES.piping.alt}
                      credit={IMAGES.piping.credit}
                      className="mt-6 h-[170px]"
                      sizes="33vw"
                    />
                  )}
                  {g.key === "electrical" && (
                    <Photo
                      src={IMAGES.wiring.src}
                      alt={IMAGES.wiring.alt}
                      credit={IMAGES.wiring.credit}
                      className="mt-6 h-[170px]"
                      sizes="33vw"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16">
          <Marquee items={SYSTEMS.map((s) => s.label)} />
        </div>
      </section>

      {/* How it works (compact) */}
      <section className="hairline-t py-20 md:py-28">
        <div className="container-ie">
          <SectionHeading
            eyebrow="How it works"
            title={
              <>
                Five steps from <span className="serif-accent">first sheet</span> to final estimate.
              </>
            }
          />
          <div className="mt-12 grid gap-4 md:grid-cols-5">
            {PROCESS.map((p, i) => (
              <div key={p.index} className="reveal" style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="card-surface h-full p-6">
                  <span className="mono-num font-display text-3xl font-bold text-ink/20">{p.index}</span>
                  <p className="mt-4 font-display text-[17px] font-bold tracking-tight">{p.title}</p>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
