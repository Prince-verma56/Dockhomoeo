"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Registers ScrollTrigger exactly once per client bundle. Importing gsap and
 * ScrollTrigger from here (never from "gsap" directly in components) keeps the
 * plugin registration in one place and avoids duplicate registration warnings.
 */
let registered = false;

if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export { gsap, ScrollTrigger };
