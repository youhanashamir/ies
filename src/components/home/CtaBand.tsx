import Link from "next/link";
import { ArrowUpRight, MessageCircleQuestion } from "lucide-react";
import { SITE } from "@/lib/content";

type CtaBandProps = {
  title?: string;
  text?: string;
};

export default function CtaBand({
  title = "Ready for your next bid?",
  text = "Send us your project drawings and scope requirements to get started. We confirm scope, fee, and deadline before any work begins.",
}: CtaBandProps) {
  return (
    <section className="print-hide py-20 md:py-28">
      <div className="container-ie">
        <div className="reveal-scale relative overflow-hidden rounded-[28px] bg-ink px-7 py-14 text-bg md:px-16 md:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent/25 blur-3xl"
          />
          <div className="relative grid items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="eyebrow eyebrow-dot mb-5 !text-bg/60">Get started</p>
              <h2 className="display-h2 !text-bg text-balance">
                {title.replace(/bid\?$/, "")}
                {title.endsWith("bid?") && <span className="serif-accent !text-accent">bid?</span>}
              </h2>
              <p className="mt-5 max-w-xl text-pretty text-bg/70">{text}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:col-span-5 md:justify-end">
              <Link
                href="/submit-bid"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[15px] font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                    Submit a Project <ArrowUpRight size={15} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-bg/25 px-6 py-3.5 text-[15px] font-medium text-bg transition-colors hover:bg-bg/10"
              >
                <MessageCircleQuestion size={15} /> Contact Us
              </Link>
            </div>
          </div>
          <p className="relative mt-12 font-display text-[15px] font-semibold tracking-tight text-bg/60 md:text-base">
            {SITE.closing}
          </p>
        </div>
      </div>
    </section>
  );
}
