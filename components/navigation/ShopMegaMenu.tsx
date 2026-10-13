"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DURATION, EASE_PREMIUM_BEZIER } from "@/lib/animation/motion";
import { shopMenu, type NavLink } from "@/components/navigation/navLinks";

/** Hover intent: long enough to ignore a pointer crossing the bar, short enough to feel immediate. */
const OPEN_DELAY = 90;
/** Grace period for the pointer to travel from the bar into the panel. */
const CLOSE_DELAY = 180;

type ShopMegaMenuProps = {
  /** Shared pill styling from the header, so Shop matches its siblings. */
  className?: string;
  active?: boolean;
};

/**
 * Shop in the desktop header, following the WAI-ARIA disclosure navigation
 * pattern rather than a menu: "Shop" is a real link to /products, and the
 * chevron beside it is the only control that toggles the panel.
 *
 * - Mouse/pen hover over the group opens the panel without navigating; the
 *   panel hangs from a padded bridge so moving into it never closes it.
 * - Touch never "hovers": a tap on Shop navigates, a tap on the chevron toggles.
 * - A click or keyboard toggle pins the panel open until Escape, a click or
 *   focus outside, or a second toggle.
 * - ArrowDown on the chevron opens and moves into the panel; arrows move
 *   between links there; Escape closes and returns focus to the chevron.
 */
export function ShopMegaMenu({ className, active = false }: ShopMegaMenuProps) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const rootRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const reducedMotion = useReducedMotion();

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
              // Already open from hover: a click confirms it rather than
              // snapping it shut under the pointer.
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
              // The panel mounts on this render; focus once it exists.
              requestAnimationFrame(() => focusPanelLink(0));
            }
          }}
          className="mr-1 grid size-7 place-items-center rounded-full text-current transition-colors hover:bg-[#0d5a43]/10"
        >
          <ChevronDown
            aria-hidden
            className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
            strokeWidth={2}
          />
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          // The top padding is the hover bridge between the bar and the panel.
          <div className="absolute top-full left-0 z-50 pt-3" id={panelId}>
            <motion.div
              ref={panelRef}
              onKeyDown={onPanelKeyDown}
              initial={reducedMotion ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6 }}
              transition={{ duration: DURATION.fast, ease: EASE_PREMIUM_BEZIER }}
              className="w-[520px] rounded-3xl border border-white/40 bg-white/85 p-5 shadow-[0_16px_42px_rgba(0,0,0,0.08),inset_0_1px_1.5px_rgba(255,255,255,0.8)] backdrop-blur-2xl"
            >
              <div className="grid grid-cols-2 gap-x-6">
                <MenuColumn title="By form" links={shopMenu.byForm} onNavigate={() => close()} />
                <MenuColumn title="By health goal" links={shopMenu.byGoal} onNavigate={() => close()} />
              </div>
              <ul className="mt-4 flex items-center justify-between border-t border-line/60 pt-4">
                {shopMenu.more.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => close()}
                      className="group inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[0.8125rem] font-semibold text-forest transition-colors hover:bg-forest/6"
                    >
                      {link.label}
                      <ArrowRight
                        aria-hidden
                        className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function MenuColumn({
  title,
  links,
  onNavigate,
}: {
  title: string;
  links: NavLink[];
  onNavigate: () => void;
}) {
  const headingId = useId();
  return (
    <div>
      <p id={headingId} className="dh-eyebrow mb-2.5 px-3 text-muted-ink">
        {title}
      </p>
      <ul aria-labelledby={headingId} className="flex flex-col">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onNavigate}
              className="block rounded-xl px-3 py-2.5 text-[0.875rem] font-medium text-ink/80 transition-colors duration-200 hover:bg-forest/6 hover:text-forest"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
