import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Check, Plus } from "lucide-react";
import CtaBand from "@/components/home/CtaBand";
import JsonLd from "@/components/seo/JsonLd";
import PageHero from "@/components/ui/PageHero";
import Photo from "@/components/ui/Photo";
import SectionHeading from "@/components/ui/SectionHeading";
import { PROCESS, SECTORS, SERVICES } from "@/lib/content";
import { SERVICE_PAGES, servicePage } from "@/lib/service-pages";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = servicePage(slug);
  if (!page) return {};
  return pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/services/${page.slug}`,
    keywords: page.keywords,
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const page = servicePage(slug);
  const service = SERVICES.find((s) => s.slug === slug);
  if (!page || !service) notFound();

  const others = SERVICES.filter((s) => s.slug !== slug);

  return (
    <>
      <JsonLd data={serviceJsonLd(page, service)} />
      <PageHero
        eyebrow={page.eyebrow}
        title={page.h1}
        description={page.intro}
        image={service.image.src}
        alt={service.image.alt}
      />

      {/* Who it's for */}
      <section className="py-20 md:py-28">
        <div className="container-ie">
          <SectionHeading eyebrow="Who it's for" title={page.audienceTitle} />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {page.audience.map((item, i) => (
              <div key={item.title} className="reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="card-surface flex h-full flex-col gap-3 p-8">
                  <h3 className="font-display text-[21px] font-bold tracking-tight">{item.title}</h3>
                  <p className="text-[15.5px] leading-relaxed text-muted">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="hairline-t py-20 md:py-28">
        <div className="container-ie grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="reveal-left lg:col-span-5">
            <Photo
              src={service.image.src}
              alt={service.image.alt}
              credit={service.image.credit}
              className="h-[320px] md:h-[480px]"
              sizes="(max-width: 1024px) 100vw, 42vw"
              caption={service.short}
            />
          </div>
          <div className="reveal-right lg:col-span-7">
            <span className="eyebrow">Deliverables</span>
            <h2 className="display-h2 mt-4 text-balance">{page.deliverablesTitle}</h2>
            <p className="mt-6 max-w-2xl text-pretty text-muted">{service.detail}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {page.deliverables.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl border hairline bg-surface px-4 py-3 text-[14.5px]">
                  <Check size={15} className="mt-1 flex-none text-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/submit-bid" className="btn-primary">
                Submit your plans <ArrowUpRight size={15} />
              </Link>
              <Link href="/contact" className="btn-ghost">
                Ask about scope
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="hairline-t py-20 md:py-28">
        <div className="container-ie">
          <SectionHeading
            eyebrow="How it works"
            title="From your plans to a bid-ready number"
            description="Upload PDF plans, agree on scope and a fixed fee, and receive an organized estimate with every assumption documented."
          />
          <ol className="mt-12 grid gap-5 md:grid-cols-5">
            {PROCESS.map((step, i) => (
              <li key={step.index} className="reveal card-surface p-6" style={{ transitionDelay: `${i * 60}ms` }}>
                <span className="mono-num text-sm font-semibold text-accent-ink">{step.index}</span>
                <h3 className="mt-3 font-display text-[18px] font-bold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Sectors */}
      <section className="hairline-t py-20 md:py-28">
        <div className="container-ie">
          <SectionHeading eyebrow="Project types" title="Residential, commercial, and industrial projects" />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SECTORS.map((sector) => (
              <li key={sector.name} className="reveal border hairline p-5">
                <p className="font-display text-[17px] font-bold">{sector.name}</p>
                <p className="mt-1 text-[13.5px] text-muted">{sector.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="hairline-t py-20 md:py-28">
        <div className="container-ie">
          <SectionHeading eyebrow="Frequently asked" title={`${page.eyebrow}: common questions`} />
          <div className="mt-12 max-w-4xl divide-y divide-line border-y hairline">
            {page.faqs.map((f) => (
              <details key={f.q} className="reveal group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
                  <h3 className="font-display text-[18px] font-bold tracking-tight md:text-[20px]">{f.q}</h3>
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border hairline transition-transform group-open:rotate-45">
                    <Plus size={15} />
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related services */}
      <section className="hairline-t py-20 md:py-28">
        <div className="container-ie">
          <p className="eyebrow eyebrow-dot mb-6">Related services</p>
          <div className="grid gap-5 md:grid-cols-2">
            {others.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="card-surface group flex items-center justify-between gap-6 p-7 transition-colors hover:border-accent"
              >
                <span>
                  <span className="block font-display text-[20px] font-bold tracking-tight">{s.title}</span>
                  <span className="mt-1 block text-[14px] text-muted">{s.description}</span>
                </span>
                <ArrowRight size={18} className="flex-none text-accent transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
          <p className="mt-8 text-[14px] text-muted">
            See all <Link href="/services" className="link-underline text-ink">estimating services</Link> or{" "}
            <Link href="/submit-bid" className="link-underline text-ink">submit a project</Link> for review.
          </p>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
