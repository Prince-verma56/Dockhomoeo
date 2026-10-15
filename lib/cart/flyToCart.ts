import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/animation/motion";

/**
 * The add-to-cart flight: a temporary copy of the product image lifts off the
 * card (or product page), arcs across the screen into the right-side cart sheet,
 * and settles gracefully onto that product's thumbnail.
 *
 * It is presentation only. The cart store has already been updated before the
 * flight starts. The copy is a cloned, inert, aria-hidden node on <body>.
 *
 * Trajectory:
 * - Anticipation lift (0.22s): Lifts off with organic shadow bloom & subtle scale
 * - Cubic Bézier flight (0.65s): Smooth parabolic curve, aerodynamic tilt, dynamic
 *   destination tracking while the drawer slides in
 * - Landing settle (0.18s): Micro-compression into the slot, spring rebound on
 *   the real thumbnail, soft emerald ring pulse, seamless opacity crossfade
 * Total duration: ~1.05s (within target 800–1100 ms)
 */

export type Flight = {
  /** Settles when the copy has landed (or the flight was abandoned). Never rejects. */
  done: Promise<void>;
  /** Stops at once and removes the copy. Safe to call more than once. */
  cancel: () => void;
};

const LIFT_SECONDS = 0.22;
const FLIGHT_SECONDS = 0.65;
const LANDING_SECONDS = 0.18;
/** Max wait for the sheet to mount the line thumbnail. */
const TARGET_TIMEOUT_MS = 1000;
/** Peak aerodynamic banking angle along the curved flight path (degrees). */
const PEAK_TILT = 3.6;

export const cartThumbSelector = (variantId: number) => `[data-cart-thumb="${variantId}"]`;

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * Polls for the line's thumbnail element as the cart sheet mounts and opens.
 */
async function waitForTarget(variantId: number, isCancelled: () => boolean): Promise<HTMLElement | null> {
  const started = performance.now();
  let target: HTMLElement | null = null;
  while (!isCancelled() && performance.now() - started < TARGET_TIMEOUT_MS) {
    target = document.querySelector<HTMLElement>(cartThumbSelector(variantId));
    if (target) break;
    await nextFrame();
  }
  if (!target || isCancelled() || !target.isConnected) return null;
  target.scrollIntoView({ block: "nearest" });
  return target;
}

function makeCopy(source: HTMLElement, rect: DOMRect): HTMLElement {
  const copy = source.cloneNode(true) as HTMLElement;
  copy.removeAttribute("data-product-media");
  copy.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
  copy.setAttribute("aria-hidden", "true");
  copy.inert = true;

  const radius = getComputedStyle(source).borderRadius;

  Object.assign(copy.style, {
    position: "fixed",
    left: "0px",
    top: "0px",
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: "0",
    zIndex: "75",
    pointerEvents: "none",
    overflow: "hidden",
    borderRadius: radius && radius !== "0px" ? radius : "20px",
    boxShadow: "0 10px 28px -6px rgba(13, 90, 67, 0.22), 0 6px 14px -4px rgba(20, 37, 31, 0.14)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    willChange: "transform, width, height, border-radius, opacity",
    transformOrigin: "center center",
    transform: `translate3d(${rect.left}px, ${rect.top}px, 0)`,
  } satisfies Partial<CSSStyleDeclaration>);

  return copy;
}

export function flyToCart(source: HTMLElement, variantId: number): Flight {
  if (prefersReducedMotion()) {
    // Under reduced motion, immediately clear any pending attribute on target and resolve
    const target = document.querySelector<HTMLElement>(cartThumbSelector(variantId));
    target?.removeAttribute("data-flight-pending");
    return {
      done: Promise.resolve(),
      cancel: () => {},
    };
  }

  let cancelled = false;
  let copy: HTMLElement | null = null;
  let abort: () => void = () => undefined;
  const aborted = new Promise<void>((resolve) => (abort = resolve));
  const settle = <T>(promise: Promise<T>): Promise<T | undefined> =>
    Promise.race([promise, aborted.then(() => undefined)]);
  const tweens: gsap.core.Animation[] = [];

  const cleanup = () => {
    tweens.forEach((tween) => tween.kill());
    tweens.length = 0;
    // Clear lingering data-flight-pending on the target thumbnail if flight was cancelled
    const pendingThumb = document.querySelector<HTMLElement>(`[data-cart-thumb="${variantId}"][data-flight-pending]`);
    pendingThumb?.removeAttribute("data-flight-pending");
    copy?.remove();
    copy = null;
  };

  const done = (async () => {
    const from = source.getBoundingClientRect();
    // Nothing visible to fly (collapsed, off-screen, detached): skip quietly.
    if (from.width < 4 || from.height < 4 || from.bottom < 0 || from.top > window.innerHeight) return;

    copy = makeCopy(source, from);
    document.body.appendChild(copy);

    const liftOffset = Math.min(16, Math.max(8, from.height * 0.05));

    // Phase 1: Lift off with tactile anticipation and organic shadow elevation
    const lift = gsap.to(copy, {
      duration: LIFT_SECONDS,
      ease: "power2.out",
      scale: 1.04,
      y: `-=${liftOffset}`,
      boxShadow: "0 28px 56px -12px rgba(13, 90, 67, 0.35), 0 16px 32px -8px rgba(20, 37, 31, 0.25)",
      transformOrigin: "center center",
    });
    tweens.push(lift);

    // Concurrently wait for target thumbnail as the sheet opens
    const targetPromise = waitForTarget(variantId, () => cancelled);
    const targetResult = await settle(targetPromise);
    await settle(lift.then(() => undefined));
    const target: HTMLElement | null = targetResult ?? null;

    if (cancelled || !copy) return;

    if (!target) {
      // The sheet closed or never showed the line: dissolve where it is.
      const node = copy;
      await settle(
        new Promise<void>((resolve) => {
          tweens.push(gsap.to(node, { duration: 0.2, opacity: 0, scale: 0.9, onComplete: resolve }));
        })
      );
      return;
    }

    // Measure live geometry at the handoff point
    const startCenter = {
      x: from.left + from.width / 2,
      y: from.top + from.height / 2 - liftOffset,
    };

    const initialEnd = target.getBoundingClientRect();
    let lastEx = initialEnd.left + initialEnd.width / 2;
    let lastEy = initialEnd.top + initialEnd.height / 2;
    let lastEw = initialEnd.width || 80;
    let lastEh = initialEnd.height || 80;

    const w0 = from.width;
    const h0 = from.height;
    const r0 = parseFloat(getComputedStyle(source).borderRadius) || 20;
    const endRadius = parseFloat(getComputedStyle(target).borderRadius) || 12;

    const progress = { t: 0 };
    const node = copy;

    // Reset GSAP scale and position on the node so we drive coordinates continuously
    gsap.set(node, { scale: 1, x: 0, y: 0 });

    // Phase 2: Cinematic Cubic Bézier Flight
    await settle(
      new Promise<void>((resolve) => {
        tweens.push(
          gsap.to(progress, {
            t: 1,
            duration: FLIGHT_SECONDS,
            ease: "power2.inOut",
            onUpdate: () => {
              const t = progress.t;

              // Read live target center and dimensions as the drawer slides in
              if (target.isConnected) {
                const live = target.getBoundingClientRect();
                lastEx = live.left + live.width / 2;
                lastEy = live.top + live.height / 2;
                lastEw = live.width || 80;
                lastEh = live.height || 80;
              }

              const sx = startCenter.x;
              const sy = startCenter.y;
              const ex = lastEx;
              const ey = lastEy;
              const ew = lastEw;
              const eh = lastEh;

              const dx = ex - sx;
              const dy = ey - sy;
              const dist = Math.hypot(dx, dy);

              // Natural parabolic arc height proportional to travel distance
              const arcHeight = Math.min(220, Math.max(55, dist * 0.25));

              // Cubic Bézier control points:
              // P1: lifts up and pushes forward in direction of motion
              // P2: arches smoothly down toward the destination angle
              const p0x = sx, p0y = sy;
              const p1x = sx + dx * 0.22, p1y = sy - arcHeight;
              const p2x = ex - dx * 0.20, p2y = ey - arcHeight * 0.35;
              const p3x = ex, p3y = ey;

              // Cubic Bezier interpolation: B(t)
              const u = 1 - t;
              const u2 = u * u;
              const u3 = u2 * u;
              const t2 = t * t;
              const t3 = t2 * t;

              const curX = u3 * p0x + 3 * u2 * t * p1x + 3 * u * t2 * p2x + t3 * p3x;
              const curY = u3 * p0y + 3 * u2 * t * p1y + 3 * u * t2 * p2y + t3 * p3y;

              // Progressive size reduction: stays legible during liftoff, smoothly morphs into thumb
              const sizeEased = t < 0.25 ? t * 0.6 : t < 0.75 ? 0.15 + (t - 0.25) * 1.3 : 0.8 + (t - 0.75) * 0.8;
              const s = Math.min(1, Math.max(0, sizeEased));
              const curW = w0 + (ew - w0) * s;
              const curH = h0 + (eh - h0) * s;

              // Border radius morph
              const curRadius = r0 + (endRadius - r0) * t;

              // Aerodynamic tilt (banking into the curved trajectory)
              const tiltDir = dx >= 0 ? -1 : 1;
              const tilt = Math.sin(Math.PI * t) * PEAK_TILT * tiltDir;

              // Apply GPU accelerated transform
              node.style.width = `${curW}px`;
              node.style.height = `${curH}px`;
              node.style.borderRadius = `${curRadius}px`;
              node.style.transform = `translate3d(${curX - curW / 2}px, ${curY - curH / 2}px, 0) rotate(${tilt}deg)`;
            },
            onComplete: resolve,
          })
        );
      })
    );

    if (cancelled) return;

    // Phase 3: Gentle Landing & Tactile Settle
    // Reveal the real target thumbnail seamlessly under the arriving copy
    target.removeAttribute("data-flight-pending");

    await settle(
      new Promise<void>((resolve) => {
        // Clone compresses slightly and dissolves cleanly
        tweens.push(
          gsap.to(node, {
            opacity: 0,
            scale: 0.94,
            duration: LANDING_SECONDS,
            ease: "power2.out",
            onComplete: resolve,
          })
        );

        // Real target thumbnail gives a springy, satisfying landing rebound
        tweens.push(
          gsap.fromTo(
            target,
            { scale: 0.92 },
            { scale: 1, duration: 0.45, ease: "back.out(2.4)", clearProps: "transform" }
          )
        );

        // Subtle emerald pulse ring on thumbnail celebrating the addition
        tweens.push(
          gsap.fromTo(
            target,
            { boxShadow: "0 0 0 3px rgba(13, 90, 67, 0.4)" },
            { boxShadow: "0 0 0 0px rgba(13, 90, 67, 0)", duration: 0.5, ease: "power2.out", clearProps: "boxShadow" }
          )
        );
      })
    );
  })()
    .catch(() => undefined)
    .finally(cleanup);

  return {
    done,
    cancel: () => {
      cancelled = true;
      abort();
      cleanup();
    },
  };
}

