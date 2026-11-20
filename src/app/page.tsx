import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import Hero from "@/components/home/Hero";
import CtaBand from "@/components/home/CtaBand";
import Marquee from "@/components/ui/Marquee";
import Photo from "@/components/ui/Photo";
import SectionHeading from "@/components/ui/SectionHeading";
import { pageMetadata } from "@/lib/seo";
import { IMAGES, POLICIES, PROCESS, REASONS, SECTORS, SERVICES, SPECIALIZATION, SYSTEMS } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Electrical & MEP Estimating Services for US Contractors",
  absoluteTitle: true,
  description:
    "Electrical estimating, electrical takeoff, and MEP estimating services for US contractors. Upload your plans and get accurate quantities and bid-ready estimates.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Why choose us */}
      <section className="py-20 md:py-32">
        <div className="container-ie">
          <SectionHeading
            eyebrow="Why contractors choose us"
            title={
              <>
                Built for bid day. <span className="serif-accent">Precise by design.</span> Backed by clear scope.
              </>
            }
            description="You work directly with the estimators handling your drawings — no vague allowances, no surprise exclusions, and no guesswork in your numbers."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {REASONS.map((r, i) => (
              <div key={r.index} className="reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="card-surface tilt-hover flex h-full min-h-[250px] flex-col gap-4 p-8">
                  <span className="eyebrow">{r.index}</span>
                  <p className="font-display text-[22px] font-bold tracking-tight">{r.title}</p>
                  <p className="text-[15.5px] leading-relaxed text-muted">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="hairline-t py-20 md:py-32">
        <div className="container-ie">
          <SectionHeading
            eyebrow="Our services"
            title={
              <>
                Everything your bid <span className="serif-accent">needs quantified</span> — from counts to costs.
              </>
            }
            description="Three focused services that cover the full estimating workflow: drawing-based takeoffs, complete electrical pricing, and coordinated MEP estimates."
            aside={
              <Link href="/services" className="btn-ghost">
                View all services <ArrowRight size={14} />
              </Link>
            }
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <article key={s.slug} className="reveal" style={{ transitionDelay: `${i * 90}ms` }}>
                <Link
                  href={`/services/${s.slug}`}
                  className="card-surface tilt-hover group flex h-full flex-col overflow-hidden"
                >
                  <Photo
                    src={s.image.src}
                    alt={s.image.alt}
                    credit={s.image.credit}
                    className="h-[260px] !rounded-none !border-0 md:h-[300px]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    caption={s.short}
                  />
                  <div className="flex flex-1 flex-col gap-4 p-7 md:p-8">
                    <div className="flex items-center justify-between">
                      <span className="eyebrow">{s.index}</span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border hairline transition-colors group-hover:bg-ink group-hover:text-bg">
                        <ArrowUpRight size={15} />
                      </span>
                    </div>
                    <h3 className="font-display text-[24px] font-bold tracking-tight">{s.title}</h3>
                    <p className="text-[15.5px] leading-relaxed text-muted">{s.description}</p>
                    <ul className="mt-auto space-y-2 pt-2 text-[14px]">
                      {s.includes.slice(0, 3).map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-ink/85">
                          <Check size={14} className="mt-1 flex-none text-accent" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="hairline-t py-20 md:py-32">
        <div className="container-ie">
          <SectionHeading
            eyebrow="Our process"
            title={
              <>
                From drawings <span className="serif-accent">to bid-ready</span> estimate.
              </>
            }
            description="Five clear steps. You always know what is included, what is excluded, when it arrives, and what it costs — before we start."
          />

          <div className="mt-14 grid gap-10 lg:grid-cols-12">
            <div className="reveal-left lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <Photo
                  src={IMAGES.blueprintsFlat.src}
                  alt={IMAGES.blueprintsFlat.alt}
                  credit={IMAGES.blueprintsFlat.credit}
                  className="h-[320px] md:h-[460px] lg:h-[560px]"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  caption="Sheet-by-sheet, traceable quantities"
                />
              </div>
            </div>
            <ol className="lg:col-span-7">
              {PROCESS.map((step, i) => (
                <li
                  key={step.index}
                  className="reveal hairline-t grid grid-cols-[64px_1fr] gap-4 py-7 first:border-t-0 md:grid-cols-[96px_1fr] md:py-9"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <span className="mono-num font-display text-[28px] font-bold tracking-tight text-ink/25 md:text-[40px]">
                    {step.index}
                  </span>
                  <div>
                    <h3 className="font-display text-[22px] font-bold tracking-tight md:text-[26px]">{step.title}</h3>
                    <p className="mt-2 max-w-xl text-[15.5px] leading-relaxed text-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Systems marquee */}
      <section className="hairline-t py-14 md:py-20">
        <div className="container-ie mb-8 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
          <p className="eyebrow eyebrow-dot">Systems we quantify</p>
          <p className="max-w-md text-sm text-muted">
            Lighting through plumbing — every system counted from your drawings and priced with current material and
            labor data.
          </p>
        </div>
        <Marquee items={SYSTEMS.filter((s) => s.id !== "other").map((s) => s.label)} />
      </section>

      {/* Sectors */}
      <section id="sectors" className="hairline-t py-20 md:py-32">
        <div className="container-ie">
          <SectionHeading
            eyebrow="Project types"
            title={
              <>
                Estimating across <span className="serif-accent">every sector</span> you bid.
              </>
            }
            description="From a single-floor tenant fit-out to a multi-building campus or data center, the method is the same: count it, price it, document it."
          />

          <div className="mt-14 grid gap-5 md:grid-cols-12">
            <div className="reveal md:col-span-5">
              <Photo
                src={IMAGES.highrise.src}
                alt={IMAGES.highrise.alt}
                credit={IMAGES.highrise.credit}
                className="h-[280px] md:h-full md:min-h-[420px]"
                sizes="(max-width: 768px) 100vw, 40vw"
                caption="Commercial & high-rise"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 md:col-span-7 lg:grid-cols-4">
              {SECTORS.map((sector, i) => (
                <div key={sector.name} className="reveal" style={{ transitionDelay: `${i * 50}ms` }}>
                  <div className="card-surface tilt-hover flex h-full flex-col justify-between gap-6 p-5">
                    <span className="eyebrow">0{i + 1}</span>
                    <div>
                      <p className="font-display text-[17px] font-bold tracking-tight">{sector.name}</p>
                      <p className="mt-1 text-[12.5px] leading-snug text-muted">{sector.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="reveal md:col-span-7">
              <Photo
                src={IMAGES.industrialFacade.src}
                alt={IMAGES.industrialFacade.alt}
                credit={IMAGES.industrialFacade.credit}
                className="h-[260px] md:h-[320px]"
                sizes="(max-width: 768px) 100vw, 60vw"
                caption="Industrial & warehouse"
              />
            </div>
            <div className="reveal md:col-span-5">
              <Photo
                src={IMAGES.dataCables.src}
                alt={IMAGES.dataCables.alt}
                credit={IMAGES.dataCables.credit}
                className="h-[260px] md:h-[320px]"
                sizes="(max-width: 768px) 100vw, 40vw"
                caption="Data center & low voltage"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section id="about" className="hairline-t py-20 md:py-32">
        <div className="container-ie grid items-start gap-12 lg:grid-cols-12">
          <div className="reveal-left lg:col-span-6">
            <p className="eyebrow eyebrow-dot mb-5">About the company</p>
            <h2 className="display-h2 text-balance">
              Estimators who treat your bid <span className="serif-accent">like their own.</span>
            </h2>
            <p className="mt-6 max-w-xl text-pretty text-muted">
              International Estimating provides professional electrical takeoffs, complete electrical cost estimating,
              and MEP estimating services worldwide. We deliver accurate, drawing-based quantities and detailed cost
              breakdowns to help contractors prepare competitive bids.
            </p>
            <p className="mt-4 max-w-xl text-pretty text-muted">
              <span className="font-semibold text-ink">Our specialization:</span> {SPECIALIZATION}
            </p>
            <Link href="/about" className="btn-ghost mt-8">
              Read our story & policies <ArrowRight size={14} />
            </Link>

            <div className="mt-12 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {POLICIES.slice(0, 4).map((p) => (
                <div key={p.index} className="hairline-t pt-4">
                  <p className="eyebrow">Policy {p.index}</p>
                  <p className="mt-1.5 font-display text-[17px] font-bold tracking-tight">{p.title}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal-right lg:col-span-6">
            <div className="grid grid-cols-5 gap-4">
              <Photo
                src={IMAGES.teamSite.src}
                alt={IMAGES.teamSite.alt}
                credit={IMAGES.teamSite.credit}
                className="col-span-5 h-[300px] md:h-[400px]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <Photo
                src={IMAGES.electrician.src}
                alt={IMAGES.electrician.alt}
                credit={IMAGES.electrician.credit}
                className="col-span-2 h-[200px] md:h-[260px]"
                sizes="(max-width: 1024px) 40vw, 20vw"
              />
              <div className="card-surface col-span-3 flex flex-col justify-between p-6">
                <p className="eyebrow">What you receive</p>
                <ul className="mt-4 space-y-2 text-[14px]">
                  {[
                    "Itemized material & labor breakdown",
                    "Counts organized by system, floor or sheet",
                    "Documented assumptions & exclusions",
                    "Revision support for addenda",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2.5">
                      <Check size={14} className="mt-1 flex-none text-accent" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>


      <CtaBand />
    </>
  );
}
