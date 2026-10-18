"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Award, ChevronDown, Package, Sparkles } from "lucide-react";
import { MagneticItem } from "@/components/ui/magnetic-dock";
import { cn } from "@/lib/utils";
import { DURATION, EASE_PREMIUM_BEZIER } from "@/lib/animation/motion";

/** Near-instant hover response for snappy, premium interaction without lag. */
const OPEN_DELAY = 15;
/** Grace period for pointer to navigate comfortably into the panel. */
const CLOSE_DELAY = 150;

type ShopMegaMenuProps = {
  /** Shared pill styling from the header, so Shop matches its siblings. */
  className?: string;
  active?: boolean;
};

interface CuratedItem {
  title: string;
  subtitle: string;
  href: string;
  image: string;
}

const CURATED_COLLECTIONS: CuratedItem[] = [
  {
    title: "Drops & Dilutions",
    subtitle: "Potent liquid remedies",
    href: "/products?form=drops",
    image: "/Images/Editorial/eucalyptus-dropper-bottle.webp",
  },
  {
    title: "Tablets & Pellets",
    subtitle: "Biochemics & globules",
    href: "/products?form=tablets",
    image: "/Images/Editorial/chamomilla-pellet-bottle.webp",
  },
  {
    title: "Mother Tinctures",
    subtitle: "Standardized Q extracts",
    href: "/products?form=tincture",
    image: "/Images/Products/schwabe-alfalfa.jpg",
  },
  {
    title: "Creams & Ointments",
    subtitle: "External herbal care",
    href: "/products?form=cream",
    image: "/Images/Editorial/arnica-cream-tube.webp",
  },
  {
    title: "Immunity Boosters",
    subtitle: "Daily holistic defense",
    href: "/products?category=immunity",
    image: "/Images/HealthGoals/immunity.webp",
  },
  {
    title: "Skin & Complexion",
    subtitle: "Gentle natural radiance",
    href: "/products?category=skin-care",
    image: "/Images/HealthGoals/skincare.webp",
  },
  {
    title: "Digestive Balance",
    subtitle: "Gut & metabolic ease",
    href: "/products?category=digestive",
    image: "/Images/HealthGoals/digestive.webp",
  },
  {
    title: "Sleep & Calm",
    subtitle: "Restoration & rest",
    href: "/products?category=sleep-stress",
    image: "/Images/HealthGoals/sleep-stress.webp",
  },
];

/**
 * ShopMegaMenu — luxury frosted glassmorphic drawer matching the reference design.
 * Features 2-column curated image cards and a featured collection spotlight card.
 */
export function ShopMegaMenu({ className, active = false }: ShopMegaMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hoveredCollection, setHoveredCollection] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const rootRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearTimer = () => window.clearTimeout(timer.current);

  const close = useCallback((returnFocus = false) => {
    window.clearTimeout(timer.current);
    setOpen(false);
    setPinned(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // While open: Escape anywhere closes; a press outside closes a pinned panel.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      close(rootRef.current?.contains(document.activeElement) ?? false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, close]);

  const focusPanelLink = (index: number | "last") => {
    const links = [...(panelRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [])];
    if (links.length === 0) return;
    links[index === "last" ? links.length - 1 : (index + links.length) % links.length]?.focus();
  };

  const onPanelKeyDown = (event: React.KeyboardEvent) => {
    const links = [...(panelRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [])];
    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      focusPanelLink(current + 1);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      focusPanelLink(current - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusPanelLink(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusPanelLink("last");
    }
  };

  return (
    <li
      ref={rootRef}
      className="relative"
      onPointerEnter={(event) => {
        if (event.pointerType === "touch") return;
        clearTimer();
        timer.current = window.setTimeout(() => setOpen(true), open ? 0 : OPEN_DELAY);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "touch" || pinned) return;
        clearTimer();
        timer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY);
      }}
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node | null)) close();
      }}
    >
      <MagneticItem
        maxScale={1.06}
        magneticDistance={70}
        maxFloat={2}
        disabled={open}
      >
        <div
          data-state={open ? "open" : "closed"}
          className={cn(
            "flex items-center rounded-full transition-colors",
            (open || active) && "bg-[#0d5a43]/10 text-[#0d5a43]",
          )}
        >
          <Link
            href="/products"
            aria-current={active ? "page" : undefined}
            onClick={() => close()}
            className={cn(className, "pr-1.5 hover:bg-transparent", (open || active) && "text-[#0d5a43]")}
          >
            Shop
          </Link>
          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label="Shop menu"
            onClick={() => {
              clearTimer();
              if (!open) {
                setOpen(true);
                setPinned(true);
              } else if (!pinned) {
                setPinned(true);
              } else {
                close();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setOpen(true);
                setPinned(true);
                requestAnimationFrame(() => focusPanelLink(0));
              }
            }}
            className="mr-1 grid size-7 place-items-center rounded-full text-current transition-colors hover:bg-[#0d5a43]/10 cursor-pointer"
          >
            <ChevronDown
              aria-hidden
              className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
              strokeWidth={2}
            />
          </button>
        </div>
      </MagneticItem>

      {/* Fullscreen Frosted Backdrop Blur Scrim portaled directly to document.body */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open ? (
              <motion.div
                key="shop-full-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={() => close()}
                aria-hidden="true"
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md transition-all pointer-events-auto cursor-pointer"
              />
            ) : null}
          </AnimatePresence>,
          document.body,
        )}

      {/* Mega Menu Dropdown Panel */}
      <AnimatePresence>
        {open ? (
          <div className="absolute top-full -left-20 lg:-left-28 z-50 pt-3" id={panelId}>
            <motion.div
              ref={panelRef}
              onKeyDown={onPanelKeyDown}
              initial={reducedMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="w-[830px] lg:w-[890px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[2rem] border border-white/90 dark:border-white/15 bg-white/98 dark:bg-[#0c1e17]/98 backdrop-blur-3xl p-6 lg:p-7 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.35),0_10px_40px_-10px_rgba(13,90,67,0.2),inset_0_1px_2px_rgba(255,255,255,0.95)] ring-1 ring-black/5"
            >
              {/* Main Content Grid: Left 2-column Curated List + Right Featured Highlight Card */}
              <div className="grid grid-cols-[1fr_290px] lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-stretch">
                
                {/* Left Area: Curated Collections Header & 2-column Grid */}
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#0d5a43] dark:text-emerald-400">
                      Curated Collections
                    </span>
                    <Link
                      href="/categories"
                      onClick={() => close()}
                      className="text-xs font-semibold text-[#55635d] hover:text-[#0d5a43] transition-colors duration-100 cursor-pointer"
                    >
                      View all →
                    </Link>
                  </div>

                  <div
                    className="grid grid-cols-2 gap-x-2.5 gap-y-1.5 relative"
                    onMouseLeave={() => setHoveredCollection(null)}
                  >
                    {CURATED_COLLECTIONS.map((item) => {
                      const isHovered = hoveredCollection === item.title;
                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={() => close()}
                          onMouseEnter={() => setHoveredCollection(item.title)}
                          className="group relative flex items-center gap-3 rounded-2xl p-2 cursor-pointer z-10"
                        >
                          {/* Smooth Shifting Animated Background Highlight */}
                          {isHovered ? (
                            <motion.div
                              layoutId="mega-curated-hover"
                              initial={false}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 550,
                                damping: 35,
                                mass: 0.18,
                              }}
                              className="absolute inset-0 rounded-2xl bg-[#0d5a43]/10 dark:bg-emerald-500/15 pointer-events-none -z-10"
                            />
                          ) : null}

                          {/* Rounded thumbnail image matching reference design */}
                          <div className="relative size-11 lg:size-12 shrink-0 overflow-hidden rounded-xl bg-white/70 border border-white/80 shadow-2xs">
                            <img
                              src={item.image}
                              alt={item.title}
                              className={cn(
                                "size-full object-cover pointer-events-none select-none transition-transform duration-150 ease-out",
                                isHovered ? "scale-108" : "scale-100"
                              )}
                              loading="lazy"
                            />
                          </div>

                          {/* Title and subtext */}
                          <div className="min-w-0 flex-1 leading-snug">
                            <span
                              className={cn(
                                "block font-bold text-[0.84rem] lg:text-[0.875rem] tracking-tight transition-colors duration-100 truncate",
                                isHovered ? "text-[#0d5a43] dark:text-emerald-400" : "text-[#14251f] dark:text-white"
                              )}
                            >
                              {item.title}
                            </span>
                            <span className="block text-[0.7rem] lg:text-[0.72rem] text-[#55635d] dark:text-[#889891] font-medium tracking-tight truncate mt-0.5">
                              {item.subtitle}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Right Area: Large Featured Spotlight Card matching reference image */}
                <Link
                  href="/products?form=tincture"
                  onClick={() => close()}
                  className="group relative flex flex-col justify-end overflow-hidden rounded-2xl p-5 lg:p-6 text-white shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01] cursor-pointer min-h-[290px]"
                >
                  {/* Photo with subtle hover zoom */}
                  <img
                    src="/Images/SeasonalEditBG.webp"
                    alt="Botanical Mother Tinctures"
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none select-none"
                  />

                  {/* Dark gradient scrim for crystal clear white typography */}
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15 transition-opacity duration-300 group-hover:opacity-90 pointer-events-none"
                  />

                  {/* Text details */}
                  <div className="relative z-10 flex flex-col gap-1.5">
                    <span className="w-fit rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase text-white shadow-xs border border-white/25">
                      New Arrival
                    </span>
                    <h3 className="font-display text-lg lg:text-xl font-bold leading-tight tracking-tight text-white drop-shadow-sm mt-1">
                      Botanical Mother Tinctures
                    </h3>
                    <p className="line-clamp-2 text-xs leading-relaxed text-white/80 mt-0.5">
                      Standardized classical formulations from licensed European &amp; Indian pharmacopoeias.
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-emerald-300 group-hover:text-white transition-colors">
                      <span>Explore Ritual</span>
                      <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>

              </div>

              {/* Bottom Frosted Bar with Quick Shortcuts */}
              <div className="-mx-6 lg:-mx-7 -mb-6 lg:-mb-7 mt-6 flex items-center justify-between border-t border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md px-6 py-3.5">
                <div className="flex items-center gap-5 lg:gap-7">
                  <Link
                    href="/products"
                    onClick={() => close()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0d5a43] hover:text-[#063b2d] transition-colors duration-100 cursor-pointer"
                  >
                    <Package className="size-3.5" />
                    <span>Shop All Products</span>
                  </Link>
                  <Link
                    href="/categories"
                    onClick={() => close()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3a4943] hover:text-[#0d5a43] transition-colors duration-100 cursor-pointer"
                  >
                    <Sparkles className="size-3.5" />
                    <span>All Categories</span>
                  </Link>
                  <Link
                    href="/brands"
                    onClick={() => close()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3a4943] hover:text-[#0d5a43] transition-colors duration-100 cursor-pointer"
                  >
                    <Award className="size-3.5" />
                    <span>Certified Brands</span>
                  </Link>
                </div>

                <Link
                  href="/doctors"
                  onClick={() => close()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0d5a43] hover:text-[#063b2d] transition-colors duration-100 cursor-pointer group"
                >
                  <span>Consult a Doctor</span>
                  <ArrowRight className="size-3 transition-transform duration-100 group-hover:translate-x-0.5" />
                </Link>
              </div>

            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

