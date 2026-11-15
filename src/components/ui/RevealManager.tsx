"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SELECTOR = ".reveal, .reveal-left, .reveal-right, .reveal-scale";

/**
 * Observes every reveal element on the page and adds `in-view` once it
 * scrolls into the viewport. Server components can opt in purely via class.
 */
export default function RevealManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const attach = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (el.classList.contains("in-view")) return;
        if (reduce) {
          el.classList.add("in-view");
          return;
        }
        observer.observe(el);
      });
    };

    attach(document);

    const mutation = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.matches(SELECTOR)) attach(node.parentNode ?? document);
            else attach(node);
          }
        });
      }
    });
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, [pathname]);

  return null;
}
