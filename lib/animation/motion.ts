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
 * Releases a section from the pre-paint reveal gate (`.dh-motion
 * [data-motion-gate] ...` in app/globals.css).
 *
 * Call it in the same layout effect that hands the section's from-states to
 * GSAP, after the tweens exist. One attribute removal un-gates the whole
 * subtree atomically, so the browser never paints a frame where some elements
 * are released and others are not.
 */
export function releaseRevealGate(root: Element | null): void {
  root?.removeAttribute("data-motion-gate");
}
