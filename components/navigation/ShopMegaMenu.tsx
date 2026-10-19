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
          style={open ? { backdropFilter: "blur(32px) saturate(180%)", WebkitBackdropFilter: "blur(32px) saturate(180%)" } : undefined}
          className={cn(
            "flex items-center rounded-full transition-all duration-200",
            open
              ? "bg-[#091b15]/90 backdrop-blur-xl border border-white/25 border-t-white/40 text-emerald-300 shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
              : active
                ? "bg-[#0d5a43]/15 text-[#0d5a43]"
                : "hover:bg-[#0d5a43]/10",
          )}
        >
          <Link
            href="/products"
            aria-current={active ? "page" : undefined}
            onClick={() => close()}
            className={cn(className, "pr-1.5 hover:bg-transparent", open ? "text-emerald-300" : active ? "text-[#0d5a43]" : "")}
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
            className="mr-1 grid size-7 place-items-center rounded-full text-current transition-colors hover:bg-white/10 cursor-pointer"
          >
            <ChevronDown
              aria-hidden
              className={cn("size-4 transition-transform duration-200", open && "rotate-180 text-emerald-300")}
              strokeWidth={2}
            />
          </button>
        </div>
      </MagneticItem>

      {/* Smooth Frosted Backdrop Veil: enhances mega-menu contrast and legibility over the hero */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open ? (
              <motion.div
                key="shop-full-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => close()}
                aria-hidden="true"
                className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[4px] pointer-events-auto cursor-pointer"
              />
            ) : null}
          </AnimatePresence>,
          document.body,
        )}

      {/* Mega Menu Dropdown Panel */}
      <AnimatePresence>
        {open ? (
          <div className="absolute top-full left-0 sm:-left-4 lg:-left-6 z-50 pt-2" id={panelId}>
            <motion.div
              ref={panelRef}
              onKeyDown={onPanelKeyDown}
              initial={reducedMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              style={{
                backdropFilter: "blur(60px) saturate(200%) brightness(0.92)",
                WebkitBackdropFilter: "blur(60px) saturate(200%) brightness(0.92)",
              }}
              className="relative w-[720px] lg:w-[760px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-[2rem] border border-white/20 border-t-white/35 bg-[#091b15]/94 p-5 lg:p-6 shadow-[0_30px_90px_rgba(0,0,0,0.5),0_12px_36px_rgba(4,20,15,0.4)]"
            >
              {/* Subtle Top Specular Rim */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
              />

              {/* Main Content Grid: Left 2-column Curated List + Right Featured Highlight Card */}
              <div className="relative z-10 grid grid-cols-[1fr_290px] lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-stretch">
                
                {/* Left Area: Curated Collections Header & 2-column Grid */}
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-400 drop-shadow-xs">
                      Curated Collections
                    </span>
                    <Link
                      href="/categories"
                      onClick={() => close()}
                      className="text-xs font-semibold text-emerald-200/80 hover:text-white transition-colors duration-100 cursor-pointer"
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
                          className="group relative flex items-center gap-3 rounded-2xl p-2.5 bg-white/[0.07] hover:bg-white/[0.14] backdrop-blur-xl border border-white/10 hover:border-emerald-400/35 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] cursor-pointer z-10"
                        >
                          {/* Smooth Shifting Animated Frosted Glass Highlight */}
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
                              className="absolute inset-0 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 shadow-xs pointer-events-none -z-10"
                            />
                          ) : null}

                          {/* Rounded thumbnail image with frosted glass container */}
                          <div 
                            className="relative size-11 lg:size-12 shrink-0 overflow-hidden rounded-xl bg-black/40 backdrop-blur-md border border-white/15 shadow-xs"
                          >
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

                          {/* Title and subtext with crisp text legibility */}
                          <div className="min-w-0 flex-1 leading-snug">
                            <span
                              className={cn(
                                "block font-bold text-[0.84rem] lg:text-[0.875rem] tracking-tight transition-colors duration-100 truncate",
                                isHovered ? "text-emerald-300" : "text-white"
                              )}
                            >
                              {item.title}
                            </span>
                            <span className="block text-[0.7rem] lg:text-[0.72rem] text-white/70 font-medium tracking-tight truncate mt-0.5">
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
                  className="group relative flex flex-col justify-end overflow-hidden rounded-2xl p-5 lg:p-6 text-white shadow-md border border-white/20 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] cursor-pointer min-h-[290px]"
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
                    <span 
                      style={{
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                      }}
                      className="w-fit rounded-full bg-black/30 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase text-white shadow-xs border border-white/25"
                    >
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

              {/* Seamless Bottom Frosted Glass Bar */}
              <div 
                className="relative z-10 -mx-6 lg:-mx-7 -mb-6 lg:-mb-7 mt-6 flex items-center justify-between border-t border-white/10 bg-black/40 px-6 py-3.5 backdrop-blur-md"
              >
                <div className="flex items-center gap-5 lg:gap-7">
                  <Link
                    href="/products"
                    onClick={() => close()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white transition-colors duration-100 cursor-pointer"
                  >
                    <Package className="size-3.5 text-emerald-400" />
                    <span>Shop All Products</span>
                  </Link>
                  <Link
                    href="/categories"
                    onClick={() => close()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-emerald-300 transition-colors duration-100 cursor-pointer"
                  >
                    <Sparkles className="size-3.5 text-emerald-400" />
                    <span>All Categories</span>
                  </Link>
                  <Link
                    href="/brands"
                    onClick={() => close()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-emerald-300 transition-colors duration-100 cursor-pointer"
                  >
                    <Award className="size-3.5 text-emerald-400" />
                    <span>Certified Brands</span>
                  </Link>
                </div>

                <Link
                  href="/doctors"
                  onClick={() => close()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white transition-colors duration-100 cursor-pointer group"
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

