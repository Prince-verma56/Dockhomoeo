"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { gsap } from "@/lib/animation/gsap";
import { EASE, prefersReducedMotion } from "@/lib/animation/motion";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

type RisePanelProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Surface colour: neutral mist, or pale sage. */
  tone?: "mist" | "sage";
  /** Slide under the section above, so its content straddles the seam. */
  tuck?: boolean;
  /** Ease the surface back into the page canvas at the bottom. */
  settle?: boolean;
  id?: string;
  "aria-labelledby"?: string;
  "aria-label"?: string;
};

/**
 * A surface that rises out of the page canvas (`dh-rise` in app/globals.css).
 *
 * As its top edge travels up the lower half of the viewport, the panel opens
 * from a slight inset to the full width, scrubbed to the scroll. It reads as
 * the next surface sliding into place under the one above rather than a new
 * band starting. Clip-path only: nothing moves in the layout, nothing waits
 * on the animation, and the panel is complete without it (no JS, reduced
 * motion, or below the fold on load).
 */
export function RisePanel({
  children,
  className,
  as: Tag = "section",
  tone = "mist",
  tuck = false,
  settle = false,
  ...rest
}: RisePanelProps) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // The radius lives in CSS (a clamp), so read it as resolved pixels:
      // GSAP cannot interpolate through var().
      const radius = getComputedStyle(root).borderTopLeftRadius || "0px";
      const shape = (side: string) => `inset(0% ${side} 0% ${side} round ${radius} ${radius} 0px 0px)`;

      gsap.fromTo(
        root,
        { clipPath: shape("2.5%") },
        {
          clipPath: shape("0%"),
          ease: EASE.scrub,
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "top 55%",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn(
        "dh-rise",
        tone === "sage" && "dh-rise--sage",
        tuck && "dh-rise--tuck",
        settle && "dh-rise--settle",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
