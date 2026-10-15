"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface HoverExpandItem {
  label: string;
  /** Right-hand meta in the row, e.g. "7 products". */
  sublabel?: string;
  image: string;
  imageAlt?: string;
  /** CSS object-position for the photograph. */
  imagePosition?: string;
  /**
   * `photo` — fills the expanded row behind a forest scrim, text turns light.
   * `study` — a studio study on a white sweep: shown whole on the right of a
   *           pale sage row, text stays dark.
   * @default "photo"
   */
  imageKind?: "photo" | "study";
  /** Short line revealed when the row expands. */
  description?: string;
  /** Where the row leads. Rows without one are display only. */
  href?: string;
  /** Label for the call to action revealed with the row. */
  cta?: string;
}

export interface HoverExpandProps {
  items: HoverExpandItem[];
  /** Row height when collapsed, in pixels. @default 76 */
  collapsedHeight?: number;
  /** Row height when expanded, in pixels. @default 300 */
  expandedHeight?: number;
  className?: string;
}

const EASE = [0.23, 1, 0.32, 1] as const;
const noopSubscribe = () => () => {};

/**
 * An index of hairline rows. Pointing at a row (or tabbing to it) opens it to
 * a photograph and a short description while the other rows recede.
 *
 * Built for every input: on touch screens, where nothing hovers, rows stay
 * compact with a thumbnail and simply follow their link; keyboard focus opens
 * a row exactly as hover does; under reduced motion rows open without the
 * spring.
 */
export function HoverExpand({ items, collapsedHeight = 76, expandedHeight = 300, className }: HoverExpandProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const reducedMotion = useReducedMotion();
  // Only fine pointers that can hover get the expanding rows.
  const canHover = React.useSyncExternalStore(
    noopSubscribe,
    () => window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    () => true,
  );

  return (
    <ul className={cn("flex w-full flex-col border-t border-line", className)} onMouseLeave={() => setOpenIndex(null)}>
      {items.map((item, i) => {
        const open = canHover && openIndex === i;
        const receded = canHover && openIndex !== null && !open;
        const study = item.imageKind === "study";
        const light = open && !study;

        const content = (
          <>
            {/* Media */}
            {canHover ? (
              <motion.div
                aria-hidden
                className={cn("absolute inset-0", study && "dh-study")}
                initial={false}
                animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 1.06 }}
                transition={reducedMotion ? { duration: 0 } : { opacity: { duration: 0.45, ease: EASE }, scale: { duration: 0.6, ease: EASE } }}
              >
                {study ? (
                  <div className="absolute inset-y-0 right-0 w-1/2">
                    <Image src={item.image} alt="" fill sizes="(min-width: 1024px) 420px, 50vw" className="object-contain p-6" />
                  </div>
                ) : (
                  <>
                    <Image
                      src={item.image}
                      alt={item.imageAlt ?? ""}
                      fill
                      sizes="(min-width: 1024px) 860px, 100vw"
                      style={item.imagePosition ? { objectPosition: item.imagePosition } : undefined}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-forest-abyss/85 via-forest-abyss/45 to-forest-abyss/5" />
                  </>
                )}
              </motion.div>
            ) : null}

            {/* Row */}
            <div className={cn("relative flex h-full gap-4 px-1 sm:px-5", canHover ? "items-end pb-5" : "items-center")}>
              <span
                className={cn(
                  "w-7 shrink-0 text-xs tabular-nums transition-colors duration-300",
                  canHover && "pb-[0.45rem]",
                  light ? "text-white/60" : "text-muted-ink",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0 flex-1">
                <span
                  className={cn(
                    "dh-title-block block truncate transition-colors duration-300",
                    light ? "text-white" : "text-ink",
                  )}
                >
                  {item.label}
                </span>
                {!canHover && item.sublabel ? <span className="dh-meta mt-0.5 block">{item.sublabel}</span> : null}
                {canHover && (item.description || item.cta) ? (
                  <motion.div
                    initial={false}
                    animate={{ opacity: open ? 1 : 0, y: open ? 0 : 8, height: open ? "auto" : 0 }}
                    transition={reducedMotion ? { duration: 0 } : { duration: 0.32, delay: open ? 0.1 : 0, ease: EASE }}
                    className="overflow-hidden"
                  >
                    {item.description ? (
                      <p className={cn("mt-2 max-w-md text-sm leading-relaxed", light ? "text-white/80" : "text-muted-ink")}>
                        {item.description}
                      </p>
                    ) : null}
                    {item.href && item.cta ? (
                      <span
                        className={cn(
                          "mt-4 inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold",
                          light ? "bg-white text-forest-deep" : "bg-forest text-cream",
                        )}
                      >
                        {item.cta}
                        <ArrowRight aria-hidden className="size-4" />
                      </span>
                    ) : null}
                  </motion.div>
                ) : null}
              </div>

              {canHover && item.sublabel ? (
                <span
                  className={cn(
                    "shrink-0 text-xs tracking-[0.12em] uppercase transition-colors duration-300",
                    canHover && "pb-[0.45rem]",
                    light ? "text-white/70" : "text-muted-ink",
                  )}
                >
                  {item.sublabel}
                </span>
              ) : null}

              {canHover ? (
                item.href ? (
                  <ArrowUpRight
                    aria-hidden
                    className={cn(
                      "mb-[0.45rem] size-5 shrink-0 transition-[color,transform,opacity] duration-300",
                      open ? "translate-x-0.5 -translate-y-0.5 opacity-0" : "text-muted-ink",
                    )}
                  />
                ) : null
              ) : (
                // Touch: no expansion, so the photograph shows as a thumbnail.
                <span className={cn("relative size-14 shrink-0 overflow-hidden rounded-xl", study ? "dh-study" : "bg-sage-wash")}>
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="56px"
                    style={!study && item.imagePosition ? { objectPosition: item.imagePosition } : undefined}
                    className={study ? "object-contain p-1" : "object-cover"}
                  />
                </span>
              )}
            </div>
          </>
        );

        return (
          <motion.li
            key={item.label}
            className="relative w-full overflow-hidden border-b border-line"
            initial={false}
            animate={{ height: open ? expandedHeight : canHover ? collapsedHeight : "auto", opacity: receded ? 0.4 : 1 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { height: { type: "spring", stiffness: 260, damping: 32, mass: 0.9 }, opacity: { duration: 0.22, ease: "easeOut" } }
            }
            onMouseEnter={() => setOpenIndex(i)}
          >
            {item.href ? (
              <Link
                href={item.href}
                onFocus={() => setOpenIndex(i)}
                onBlur={() => setOpenIndex((current) => (current === i ? null : current))}
                className={cn("block h-full outline-offset-[-2px]", !canHover && "py-3")}
              >
                {content}
              </Link>
            ) : (
              <div className={cn("h-full", !canHover && "py-3")}>{content}</div>
            )}
          </motion.li>
        );
      })}
    </ul>
  );
}
