"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const VISITED_KEY = "ies-has-visited";
// The only logo source: drop your image at public/logo.png
const LOGO_PNG = "/logo.png";

/**
 * Intro splash shown only on a first visit or hard refresh.
 * Never replays during normal client-side navigation.
 */
export default function InitialLoader() {
  const [play, setPlay] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(false);
  const [logoMissing, setLogoMissing] = useState(false);

  useEffect(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const reloaded = navigation?.type === "reload";
    const visited = sessionStorage.getItem(VISITED_KEY) === "true";
    sessionStorage.setItem(VISITED_KEY, "true");

    // Only first visit of the session or a full page refresh.
    if (!reloaded && visited) return;

    const frame = requestAnimationFrame(() => setPlay(true));
    const leaveTimer = window.setTimeout(() => setLeaving(true), 1150);
    const doneTimer = window.setTimeout(() => setDone(true), 1750);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (done) return null;

  return (
    <AnimatePresence>
      {play && (
        <motion.div
          className="fixed inset-0 z-[200] grid place-items-center overflow-hidden bg-[#faf9ff]"
          initial={{ opacity: 1 }}
          animate={leaving ? { y: "-100%" } : { y: 0 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          onAnimationComplete={() => {
            if (leaving) setDone(true);
          }}
          aria-hidden="true"
        >
          <motion.div
            className="flex flex-col items-center gap-7 px-6"
            initial={{ opacity: 0, scale: 0.82, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {logoMissing ? (
              <span className="font-display text-6xl font-extrabold tracking-tight text-[#6B3DF4] md:text-7xl">IES</span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={LOGO_PNG} alt="IES" className="h-16 w-auto object-contain md:h-20" onError={() => setLogoMissing(true)} />
            )}
            <motion.div
              className="h-[2px] w-44 overflow-hidden bg-ink/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <motion.span
                className="block h-full w-full bg-[#6B3DF4]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={leaving ? { duration: 0.35 } : { duration: 1.0, ease: "easeInOut" }}
                style={{ transformOrigin: "left" }}
              />
            </motion.div>
          </motion.div>

          <motion.p
            className="absolute bottom-8 font-mono text-[10px] uppercase tracking-[0.3em] text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            International Estimating
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
