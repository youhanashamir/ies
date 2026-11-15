"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Full-width title banner with a background image, dark overlay and a
 * parallax effect driven by scroll progress.
 */
export default function PageHero({
  eyebrow,
  title,
  description,
  image,
  alt,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  image: string;
  alt: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.68, 0.86]);

  return (
    <section ref={ref} className="print-hide relative overflow-hidden border-b hairline">
      {/* parallax background */}
      <div className="absolute inset-0" aria-hidden="true">
        <motion.img
          src={image}
          alt={alt}
          className="h-[135%] w-full object-cover"
          style={{ y }}
          loading="eager"
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#17122e]/90 via-[#17122e]/72 to-[#17122e]/45"
          style={{ opacity: overlayOpacity }}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#17122e]/70 to-transparent" />
      </div>

      <div className="container-ie relative pb-14 pt-[128px] md:pb-20 md:pt-[168px]">
        <motion.p
          className="hero-in eyebrow mb-5 !text-white/90"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          className="display-h1 max-w-[16ch] text-balance !text-white"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            className="mt-6 max-w-2xl text-pretty text-[16px] leading-relaxed text-white/80 md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {description}
          </motion.p>
        )}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8"
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}
