import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NAV_LINKS, SERVICES, SITE } from "@/lib/content";
import { LogoMark } from "@/components/layout/Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="print-hide border-t hairline bg-surface">
      <div className="container-ie pt-14 pb-8 md:pt-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <LogoMark size={38} />
              <span className="font-display text-lg font-bold tracking-tight">{SITE.name}</span>
            </div>
            <p className="mt-5 max-w-sm text-pretty text-[15px] text-muted">
              Professional electrical takeoffs, complete electrical cost estimating, and MEP estimating services worldwide.
            </p>
            <Link href="/submit-bid" className="btn-primary btn-sm mt-6">
              Submit a Project <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-10 md:col-span-7 md:grid-cols-3">
            <div className="col-span-2 md:col-span-1">
              <p className="eyebrow mb-4">Navigate</p>
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[15px] font-medium">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="link-underline text-ink/80 hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-4">Services</p>
              <ul className="space-y-3 text-[17px] font-medium leading-snug">
                {SERVICES.map((service) => (
                  <li key={service.slug}>
                    <Link href={`/services/${service.slug}`} className="link-underline text-ink/85 hover:text-ink">
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-4">Contact & Information</p>
              <ul className="space-y-3 text-[17px] font-medium leading-snug">
                <li>
                  <a href="mailto:internationalestimatingservice@gmail.com" className="link-underline break-all text-ink/85 hover:text-ink">
                    internationalestimatingservice@gmail.com
                  </a>
                </li>
                <li>
                  <Link href="/policies" className="link-underline text-ink/85 hover:text-ink">
                    Company Policies
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="link-underline text-ink/85 hover:text-ink">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="hairline-t mt-14 flex flex-col gap-3 pt-5 text-[12px] text-muted md:mt-20 md:flex-row md:items-center md:justify-between">
          <p>© {year} {SITE.name}. All rights reserved.</p>
          <p>{SITE.closing}</p>
        </div>
      </div>
    </footer>
  );
}
