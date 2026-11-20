import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { IMAGES, SERVICES } from "@/lib/content";

export default function Hero() {
  return (
    <section id="home" className="relative isolate min-h-[760px] overflow-hidden bg-ink pt-[70px] md:min-h-[820px] md:pt-[78px]">
      <Image
        src={IMAGES.hero.src}
        alt={IMAGES.hero.alt}
        fill
        unoptimized
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,20,33,.88)_0%,rgba(13,20,33,.66)_46%,rgba(13,20,33,.18)_100%)]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#21174b]/75 to-transparent" />

      <div className="container-ie relative z-10 flex min-h-[690px] flex-col justify-end pb-12 pt-16 md:min-h-[742px] md:pb-16 md:pt-20 lg:pb-20">
        <p className="hero-in eyebrow eyebrow-dot mb-7 !text-white/85" style={{ animationDelay: "0.05s" }}>
          Electrical &amp; MEP Estimating Services · USA &amp; Worldwide
        </p>
        <h1 className="display-h1 w-full text-balance !text-white md:w-[40%]">
          <span className="hero-line">
            <span style={{ animationDelay: "0.1s" }}>Accurate Takeoffs.</span>
          </span>
          <span className="hero-line">
            <span style={{ animationDelay: "0.2s" }}>Reliable Estimates.</span>
          </span>
          <span className="hero-line">
            <span className="!text-[#d6ccff]" style={{ animationDelay: "0.3s" }}>
              Confident Bids.
            </span>
          </span>
        </h1>
        <div className="mt-7 flex flex-col gap-7 md:mt-9 md:flex-row md:items-end md:justify-between">
          <p className="hero-in w-full text-pretty text-[17px] leading-relaxed text-white/80 md:w-[40%] md:text-[19px]" style={{ animationDelay: "0.45s" }}>
            We provide electrical takeoffs, electrical estimating, and MEP estimating services to contractors across the
            United States and worldwide. Our goal is to simplify your bidding process with accurate quantities, detailed
            cost breakdowns, and reliable estimating support.
          </p>
          <div className="hero-in flex flex-wrap gap-3" style={{ animationDelay: "0.55s" }}>
            <Link href="/submit-bid" className="btn-accent">
                Submit a Project <ArrowUpRight size={15} />
            </Link>
            <Link href="/services" className="inline-flex items-center border border-white/40 px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-white hover:text-ink">
              Our Services
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/20 bg-[#21174b]/80 backdrop-blur-sm">
        <div className="container-ie grid gap-0 sm:grid-cols-3">
          {SERVICES.map((service, index) => (
            <div
              key={service.slug}
              className={`reveal flex min-h-[116px] items-center gap-4 py-6 ${index ? "sm:border-l sm:border-white/20 sm:pl-8" : ""}`}
              style={{ transitionDelay: `${index * 70}ms` }}
            >
              <span className="mono-num text-sm font-semibold text-[#d6ccff]">{service.index}</span>
              <div>
                <p className="font-display text-[17px] font-bold tracking-tight text-white">{service.title}</p>
                <p className="mt-0.5 text-[13px] text-white/60">{service.short}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-[142px] right-[clamp(20px,4vw,40px)] z-10 hidden flex-col items-center gap-1.5 text-[10px] tracking-[0.16em] text-white/70 lg:flex">
        <ArrowDown size={13} />
        <span>SCROLL</span>
      </div>
    </section>
  );
}
