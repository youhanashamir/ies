import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail, Plus, ShieldCheck } from "lucide-react";
import InquiryForm from "@/components/ask/InquiryForm";
import Photo from "@/components/ui/Photo";
import SectionHeading from "@/components/ui/SectionHeading";
import { FAQS, IMAGES, PAGE_HEROES } from "@/lib/content";
import PageHero from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact International Estimating about electrical or MEP estimating, turnaround, or scope. Send us a message and continue the conversation by email.",
};


export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact Us · Direct communication"
        title={<>Questions about <span className="serif-accent !text-[#e4dcff]">scope or timing?</span></>}
        description="Send us your question with any drawings or notes attached. We reply by email and the conversation continues in the same thread."
        image={PAGE_HEROES.contact.src}
        alt={PAGE_HEROES.contact.alt}
      />

      <section className="pb-24 md:pb-32">
        <div className="container-ie grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="reveal lg:col-span-7">
            <InquiryForm />
          </div>

          <aside className="space-y-5 lg:col-span-5">
            <div className="reveal-right card-surface p-7">
              <p className="eyebrow eyebrow-dot mb-4">What happens next</p>
              <ol className="space-y-4">
                {[
                  { t: "Your question is delivered", d: "The complete question and your details reach our team immediately." },
                  { t: "We confirm receipt", d: "You get a confirmation with a unique inquiry ID for reference." },
                  { t: "We reply by email", d: "Directly in your inbox — the thread stays in one place." },
                ].map((s, i) => (
                  <li key={s.t} className="grid grid-cols-[32px_1fr] gap-3">
                    <span className="mono-num flex h-8 w-8 items-center justify-center rounded-full border hairline text-[12px] font-semibold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-[14.5px] font-semibold">{s.t}</p>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="reveal-right" style={{ transitionDelay: "80ms" }}>
              <div className="card-surface flex flex-col gap-3 p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-bg">
                  <Mail size={15} />
                </span>
                <p className="font-display text-[16px] font-bold tracking-tight">Email</p>
                <p className="text-[13px] leading-relaxed text-muted">
                  We reply directly to your email and the thread continues there.
                </p>
                <a href="mailto:internationalestimatingservice@gmail.com" className="mt-auto inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-accent-ink hover:text-accent">
                  internationalestimatingservice@gmail.com <ArrowUpRight size={13} />
                </a>
              </div>
            </div>

            <div className="reveal-right" style={{ transitionDelay: "140ms" }}>
              <Photo
                src={IMAGES.reviewingPlans.src}
                alt={IMAGES.reviewingPlans.alt}
                credit={IMAGES.reviewingPlans.credit}
                className="h-[260px]"
                sizes="(max-width: 1024px) 100vw, 40vw"
                caption="Scope questions welcome"
              />
            </div>

            <div className="reveal-right flex items-start gap-3 rounded-2xl border hairline p-5" style={{ transitionDelay: "200ms" }}>
              <ShieldCheck size={18} className="mt-0.5 flex-none text-accent" />
              <p className="text-[13px] leading-relaxed text-muted">
                Confidentiality: client drawings and project information remain confidential and are only used to answer
                your inquiry or deliver the agreed estimating scope.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* FAQ */}
      <section className="hairline-t py-20 md:py-28">
        <div className="container-ie">
          <SectionHeading
            eyebrow="Frequently asked"
            title={
              <>
                Answers before <span className="serif-accent">you ask.</span>
              </>
            }
            description="The most common questions about our estimating services. Anything else — send it through the form above."
          />
          <div className="mt-12 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="divide-y divide-line border-y hairline">
                {FAQS.map((f, i) => (
                  <details key={f.q} className="reveal group py-5" style={{ transitionDelay: `${i * 50}ms` }}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
                      <span className="font-display text-[18px] font-bold tracking-tight md:text-[20px]">{f.q}</span>
                      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border hairline transition-transform group-open:rotate-45">
                        <Plus size={15} />
                      </span>
                    </summary>
                    <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
            <div className="reveal-right lg:col-span-5">
              <div className="card-surface soft-shadow overflow-hidden">
                <Photo
                  src={IMAGES.architectDesk.src}
                  alt={IMAGES.architectDesk.alt}
                  credit={IMAGES.architectDesk.credit}
                  className="h-[240px] !rounded-none !border-0"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="p-7">
                  <p className="eyebrow">Ready to bid?</p>
                  <p className="mt-2 font-display text-[22px] font-bold tracking-tight">Skip the questions — submit the project.</p>
                  <p className="mt-2 text-[14px] text-muted">
                    The bid form captures scope, systems, deadline, and gives you a preliminary budget instantly.
                  </p>
                  <Link href="/submit-bid" className="btn-primary mt-5">
                    Submit a Project <ArrowUpRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
