"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Registers ScrollTrigger on every client-side module evaluation.
 *
 * The previous `registered` boolean guard broke under Next.js Turbopack HMR:
 * the module re-ran with `registered = true` while the GSAP instance was
 * fresh and had no plugin attached. GSAP's registerPlugin is idempotent
 * (safe to call multiple times), so the guard is intentionally removed.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
