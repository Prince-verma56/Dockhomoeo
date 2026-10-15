"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { gsap, ScrollTrigger } from "@/lib/animation/gsap";
import { getLenis } from "@/components/providers/SmoothScrollProvider";

export type OrbitalImageWheelItem = {
  id: string;
  label: string;
  href: string;
  /** Photograph for the card. Without one the card shows the label on a sage tile. */
  src?: string;
  /** CSS object-position, for photographs whose subject sits off centre. */
  position?: string;
  /** Short line shown while the item is in focus, e.g. "8 products". */
  meta?: string;
};

export type OrbitalImageWheelProps = {
  items: OrbitalImageWheelItem[];
  /** Accessible name for the item buttons. */
  label: string;
  /**
   * Rendered wherever the wheel cannot run: no JS, reduced motion, narrow or
   * short viewports, or fewer than three items. Switched in CSS
   * (dh-orbit-* in app/globals.css), so there is no flash or layout jump.
   */
  fallback: ReactNode;
  /**
   * Label for the focused item's link button; `{label}` is replaced with the
   * item's label. A string, not a render prop, so a Server Component can set it.
   */
  actionLabel?: string;
  /** Scroll per item, in small-viewport heights. */
  stepVh?: number;
  /** Item-steps of scroll spent on the first and on the last item before moving on. */
  hold?: number;
  /** Fraction of each step spent at rest on an item rather than turning. */
  dwell?: number;
  /** Items repeat around the ring until there are at least this many cards. */
  minSlots?: number;
  className?: string;
};

/** Mirrors the media query in globals.css that shows .dh-orbit-wheel. */
export const ORBIT_QUERY = "(min-width: 768px) and (min-height: 560px)";

/** Below this a wheel says nothing a row of cards does not. */
const MIN_ITEMS = 3;
/** The pinned stretch never runs longer than this, however many items. */
const MAX_TRAVEL_VH = 260;
/** Fixed site header height plus breathing room. */
const HEADER_CLEARANCE = 96;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * A ring of cards turning past a focus point at the top of the screen as the
 * page scrolls. The section pins (CSS sticky, no GSAP pin spacer) for a
 * bounded distance: it holds on the first item, steps from item to item with
 * a rest on each, holds on the last, then lets the page scroll on.
 *
 * Items repeat around the ring so it reads as a full orbit even with a short
 * list; the copies sit on the far side, never on screen together. The cards
 * are pointer shortcuts only (aria-hidden, out of the tab order): keyboard
 * and assistive tech use the item buttons, which scroll that item into focus,
 * and the action rendered for the focused item.
 */
export function OrbitalImageWheel({
  items,
  label,
  fallback,
  actionLabel = "View {label}",
  stepVh = 34,
  hold = 0.45,
  dwell = 0.4,
  minSlots = 10,
  className,
}: OrbitalImageWheelProps) {
  const count = items.length;
  const enabled = count >= MIN_ITEMS;

  const slots = useMemo(() => {
    if (!enabled) return [];
    const repeats = Math.max(1, Math.ceil(minSlots / count));
    return Array.from({ length: count * repeats }, (_, i) => ({ key: `${items[i % count].id}-${i}`, item: items[i % count] }));
  }, [items, count, minSlots, enabled]);

  // Scroll is measured in item-steps: a hold, one step per transition, a hold.
  const units = Math.max(1, count - 1 + hold * 2);
  const travel = units * Math.min(stepVh, MAX_TRAVEL_VH / units);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!enabled || !root || !stage) return;

    const mm = gsap.matchMedia();

    mm.add(ORBIT_QUERY, () => {
      // dh-motion means JS is up and motion is allowed; without it CSS is
      // already showing the fallback and nothing here should run.
      if (!document.documentElement.classList.contains("dh-motion")) return;

      const cards = Array.from(stage.querySelectorAll<HTMLElement>("[data-orbit-card]"));
      const slotCount = cards.length;
      if (slotCount === 0) return;
      const slotAngle = (Math.PI * 2) / slotCount;

      const measure = () => {
        const width = stage.clientWidth;
        const height = stage.clientHeight;
        const cardH = clamp(height * 0.4, 220, 360);
        const cardW = Math.round(cardH * 0.78);
        return {
          cardW,
          cardH,
          radius: clamp(width * 0.4, 400, 760),
          // The focused card's centre: high enough to leave the caption room,
          // low enough to clear the fixed header.
          focusY: Math.max(height * 0.42, HEADER_CLEARANCE + cardH / 2),
        };
      };

      let geometry = measure();
      // Size is layout work: applied when the stage is measured, never per frame.
      const applySize = () => gsap.set(cards, { width: geometry.cardW, height: geometry.cardH });
      applySize();
      let focused = -1;
      const state = { step: 0 };

      const render = () => {
        const { cardW, cardH, radius, focusY } = geometry;
        cards.forEach((card, slot) => {
          const raw = (slot - state.step) * slotAngle;
          const theta = Math.atan2(Math.sin(raw), Math.cos(raw)); // -π..π, 0 at the top
          const angle = Math.abs(theta);
          const away = Math.min(1, angle / (slotAngle * 1.6));
          // Full strength at the focus, fading out by the second neighbour so
          // the outer cards never sit over the caption.
          const fade = 1 - clamp((angle - slotAngle * 0.6) / (slotAngle * 1.4), 0, 1);
          const onScreen = fade > 0.01;
          gsap.set(card, {
            x: radius * Math.sin(theta) - cardW / 2,
            y: focusY + radius * (1 - Math.cos(theta)) - cardH / 2,
            rotation: theta * (180 / Math.PI) * 0.3,
            scale: 1 - away * 0.16,
            opacity: fade,
            visibility: onScreen ? "visible" : "hidden",
            zIndex: Math.round((1 - away) * 100),
          });
        });

        const next = (((Math.round(state.step) % slotCount) + slotCount) % slotCount) % count;
        if (next !== focused) {
          focused = next;
          setActive(next);
        }
      };

      // Scroll progress → position on the ring, in item-steps, with a rest on
      // each item: the first and last `dwell / 2` of every step hold still.
      const toStep = (progress: number) => {
        const raw = progress * units - hold;
        if (raw <= 0) return 0;
        if (raw >= count - 1) return count - 1;
        const whole = Math.floor(raw);
        const part = raw - whole;
        const rest = dwell / 2;
        const t = part <= rest ? 0 : part >= 1 - rest ? 1 : (part - rest) / (1 - dwell);
        return whole + easeInOutCubic(t);
      };

      // A short follow on top of the (already smoothed) scroll, so native
      // touch scrolling and Lenis both turn the ring without stepping.
      const follow = gsap.quickTo(state, "step", { duration: 0.45, ease: "power3.out", onUpdate: render });

      const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => follow(toStep(self.progress)),
        onRefresh: (self) => {
          geometry = measure();
          applySize();
          state.step = toStep(self.progress);
          render();
        },
      });
      triggerRef.current = trigger;

      state.step = toStep(trigger.progress);
      render();

      const observer = new ResizeObserver(() => {
        geometry = measure();
        applySize();
        render();
      });
      observer.observe(stage);

      return () => {
        observer.disconnect();
        triggerRef.current = null;
      };
    });

    return () => mm.revert();
  }, [enabled, count, units, hold, dwell]);

  /** Scrolls to the point where `index` rests in focus. */
  const focusItem = (index: number) => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const target = trigger.start + ((index + hold) / units) * (trigger.end - trigger.start);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { duration: 1.1 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  const current = items[active] ?? items[0];

  return (
    <div className={className}>
      {enabled ? (
        <div ref={rootRef} className="dh-orbit-wheel relative" style={{ height: `calc(100svh + ${travel}svh)` }}>
          <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden">
            {slots.map(({ key, item }) => (
              <Link
                key={key}
                href={item.href}
                tabIndex={-1}
                aria-hidden
                data-orbit-card
                style={{ visibility: "hidden" }}
                className="group/card absolute top-0 left-1/2 block overflow-hidden rounded-[1.25rem] bg-paper shadow-lift will-change-transform"
              >
                {item.src ? (
                  <Image
                    src={item.src}
                    alt=""
                    fill
                    sizes="290px"
                    style={item.position ? { objectPosition: item.position } : undefined}
                    className="object-cover transition-transform duration-700 ease-premium group-hover/card:scale-[1.04]"
                  />
                ) : (
                  <span className="grid h-full place-items-center bg-sage-wash p-5 text-center font-display text-xl text-forest-deep">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}

            {current ? (
              <div className="absolute inset-x-0 bottom-0 z-[200] flex flex-col items-center gap-4 px-6 pb-[max(1.75rem,5svh)] text-center">
                <div role="group" aria-label={label} className="flex flex-wrap justify-center gap-2">
                  {items.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={index === active}
                      onClick={() => focusItem(index)}
                      className={cn(
                        "inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-300",
                        index === active
                          ? "border-forest-deep bg-forest-deep text-cream"
                          : "border-line bg-paper/85 text-ink backdrop-blur-sm hover:border-forest/40 hover:text-forest",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div
                  key={current.id}
                  className="flex min-h-12 items-center gap-4 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-500"
                >
                  <p className="dh-meta tabular-nums">
                    {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                    {current.meta ? ` · ${current.meta}` : null}
                  </p>
                  <Button asChild variant="brand" size="pill">
                    <Link href={current.href}>
                      {actionLabel.replace("{label}", current.label)}
                      <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={cn(enabled && "dh-orbit-fallback")}>{fallback}</div>
    </div>
  );
}

export default OrbitalImageWheel;
