/**
 * Motion tokens. Mirrors the CSS custom properties in app/globals.css so GSAP
 * and Motion animate on the same curves as CSS transitions.
 * Source of truth: brain/18_DESIGN_TOKENS.md + brain/11_ANIMATION_SPEC.md
 */

export const EASE = {
  /** Long, confident deceleration. Headings, media reveals, hero choreography. */
  premium: "power3.out",
  /** Shorter settle. Cards, list items, small entrances. */
  soft: "power2.out",
  /** Linear, for scrub-linked parallax only. */
  scrub: "none",
} as const;

export const DURATION = {
  fast: 0.22,
  medium: 0.52,
  slow: 0.94,
} as const;

/** Stagger steps, kept small so groups read as one gesture. */
export const STAGGER = {
  tight: 0.055,
  line: 0.09,
  card: 0.085,
} as const;

/** Shared cubic-bezier for Motion-driven micro-interactions. */
export const EASE_PREMIUM_BEZIER = [0.22, 1, 0.36, 1] as const;

/**
 * Single source for the reduced-motion check. Read at animation setup time
 * rather than render time so it never affects server output.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Releases an element from the pre-paint reveal gate (`.dh-motion [data-reveal]`
 * in app/globals.css).
 *
 * Call it in the same layout effect that hands the element's from-state to
 * GSAP, after the tween is created. The gate and the hand-off then happen in
 * one synchronous block, so the browser never paints the element ungated and
 * un-animated — which is the flash this whole mechanism exists to prevent.
 */
export function releaseRevealGate(root: Element | null): void {
  if (!root) return;
  root.removeAttribute("data-reveal");
  for (const el of root.querySelectorAll("[data-reveal], [data-reveal-line]")) {
    el.removeAttribute("data-reveal");
    el.removeAttribute("data-reveal-line");
  }
}
