"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/content";
import Logo, { LogoMark } from "@/components/layout/Logo";

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header className={`print-hide fixed inset-x-0 top-0 z-[100] transition-colors duration-300 ${scrolled || open ? "nav-glass" : "bg-bg"}`}>
        <div className="container-ie flex h-[70px] items-center justify-between gap-3 md:h-[78px]">
          {/* Phones: mark only. Tablets: full logo at a size that leaves room for the buttons. Desktop: full logo. */}
          <Link href="/" aria-label="International Estimating home" className="flex shrink-0 items-center sm:hidden">
            <LogoMark size={48} className="shrink-0" />
          </Link>
          <div className="hidden min-w-0 sm:block lg:hidden">
            <Logo size={50} />
          </div>
          <div className="hidden min-w-0 lg:block">
            <Logo size={52} />
          </div>

          <nav className="hidden items-center lg:flex" aria-label="Primary navigation">
            <div className="flex items-center gap-5 text-[13px] font-semibold">
              {NAV_LINKS.slice(0, 4).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`link-underline ${isActive(link.href) ? "text-ink" : "text-muted hover:text-ink"}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link href="/contact" className="btn-primary !px-3.5 !py-2.5 !text-[13px] sm:!px-4">
              <span className="hidden sm:inline">Contact Us</span>
              <span className="sm:hidden">Contact</span>
              <ArrowUpRight size={14} />
            </Link>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-[41px] w-[41px] shrink-0 items-center justify-center border hairline bg-surface lg:hidden"
            >
              {open ? <X size={19} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={`print-hide fixed inset-0 z-[90] bg-bg transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] lg:hidden ${
          open ? "translate-y-0" : "-translate-y-full"
        }`}
        aria-hidden={!open}
      >
        <div className="container-ie flex h-full flex-col justify-between pt-[106px] pb-8">
          <nav aria-label="Mobile navigation" className="border-t hairline">
            {NAV_LINKS.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="hairline-b flex items-center justify-between py-5"
              >
                <span className={`font-display text-[30px] font-bold tracking-tight ${isActive(link.href) ? "text-ink" : "text-ink/75"}`}>
                  {link.label}
                </span>
                <span className="mono-num text-[12px] text-muted">0{index + 1}</span>
              </Link>
            ))}
          </nav>
          <div className="border-t hairline pt-6">
            <p className="max-w-xs text-[14px] leading-relaxed text-muted">
              Professional electrical takeoffs, complete electrical cost estimating, and MEP estimating services worldwide.
            </p>
            <Link href="/contact" onClick={() => setOpen(false)} className="btn-primary mt-5 w-full justify-center">
              Contact Us <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
