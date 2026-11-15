"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Brand logo.
 * Drop your logo image at public/logo.png and it is used automatically
 * in the header, mobile menu, footer and intro splash. Nothing is generated;
 * if the file is missing, a plain text fallback is shown instead.
 */
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    return (
      <span
        aria-label="IES"
        className={`grid place-items-center font-display font-extrabold tracking-tight text-[#6B3DF4] ${className}`}
        style={{ height: size, width: size * 2.8, fontSize: size * 0.62 }}
      >
        IES
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="IES"
      className={`h-auto w-auto shrink-0 object-contain ${className}`}
      style={{ height: size, width: size * 2.8 }}
      onError={() => setMissing(true)}
    />
  );
}

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex min-w-0 items-center gap-3" aria-label="International Estimating home">
      <LogoMark size={compact ? 24 : 29} />
      <span className="flex min-w-0 flex-col leading-none">
        <span className={`whitespace-nowrap font-display font-bold tracking-tight text-ink ${compact ? "text-[13px]" : "text-[15px] md:text-[16px]"}`}>
          International Estimating
        </span>
        <span className="eyebrow mt-1 hidden text-[9px] tracking-[0.18em] sm:block">Electrical · MEP · Worldwide</span>
      </span>
    </Link>
  );
}
