"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type HorizontalRailProps = {
  children: ReactNode;
  className?: string;
  viewportClassName?: string;
  /** Accessible name for the arrow controls, e.g. "health goals". */
  label: string;
  /** Hides the arrow pair; mobile rails rely on swipe alone. */
  showControls?: boolean;
  /** Softens the leading and trailing edges so a cut-off card looks intended. */
  mask?: boolean;
};

/**
 * A scrollable row with optional keyboard-reachable arrow controls.
 *
 * Built on shadcn's ScrollArea so the scrollbar styling matches the rest of the
 * system. The arrows disable themselves at each end rather than disappearing,
 * which keeps the control row from reflowing.
 */
export function HorizontalRail({
  children,
  className,
  viewportClassName,
  label,
  showControls = true,
  mask = true,
}: HorizontalRailProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const reducedMotion = useReducedMotion();

  const sync = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const { scrollLeft, scrollWidth, clientWidth } = viewport;
    setAtStart(scrollLeft <= 2);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 2);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    sync();
    viewport.addEventListener("scroll", sync, { passive: true });

    const observer = new ResizeObserver(sync);
    observer.observe(viewport);

    return () => {
      viewport.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [sync]);

  const scrollBy = (direction: 1 | -1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({
      left: direction * Math.round(viewport.clientWidth * 0.7),
      // A programmatic smooth scroll is motion too — jump straight there when
      // the viewer has asked for less of it.
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <div className={cn("relative", className)}>
      <ScrollArea
        viewportRef={viewportRef}
        orientation="horizontal"
        className={cn("w-full", mask && "dh-rail-mask")}
        viewportClassName={viewportClassName}
      >
        {children}
      </ScrollArea>

      {showControls ? (
        <div className="mt-6 hidden items-center gap-2 md:flex">
          <RailButton
            direction="previous"
            label={label}
            disabled={atStart}
            onClick={() => scrollBy(-1)}
          />
          <RailButton
            direction="next"
            label={label}
            disabled={atEnd}
            onClick={() => scrollBy(1)}
          />
        </div>
      ) : null}
    </div>
  );
}

function RailButton({
  direction,
  label,
  disabled,
  onClick,
}: {
  direction: "previous" | "next";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "next" ? ChevronRight : ChevronLeft;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Scroll to ${direction} ${label}`}
      className="grid size-10 place-items-center rounded-full border border-line bg-cream text-ink transition-colors duration-200 hover:border-forest/35 hover:text-forest disabled:opacity-35 disabled:hover:border-line disabled:hover:text-ink"
    >
      <Icon className="size-4" strokeWidth={1.7} />
    </button>
  );
}
