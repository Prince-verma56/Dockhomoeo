"use client";

import {
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  setInteractiveTransitionProgress,
  cancelInteractiveTransition,
  commitInteractiveTransition,
} from "@/components/navigation/PageTransitionLoader";

const SVG_WIDTH = 44;
const SVG_HEIGHT = 68;
const ANCHOR = { x: 22, y: 0 };
const REST_CORD = 14;
const HOVER_EXTRA = 3;
const THRESHOLD = 32; // Drag distance in px to arm the transition
const MAX_DRAG = 52; // Max physical travel limit with resistance

function damp(distance: number, max: number) {
  return max * (1 - Math.exp(-distance / max));
}

function haptic(ms = 12) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(ms);
    } catch {}
  }
}

export interface WishlistHeartPullProps {
  savedCount: number;
  className?: string;
  isHome?: boolean;
  isPastHero?: boolean;
}

/**
 * WishlistHeartPull — Refined Suspended Heart Control for DocHomoeo:
 * - Minimal botanical green heart icon suspended from a fine thread.
 * - Bidirectional navigation: pulls to /favourites, and when already on /favourites,
 *   pulls to return seamlessly to the previous section/page.
 * - Gentle downward affordance on hover.
 * - Dragging downward directly drives the warm ivory transition curtain.
 * - Clean release commits smooth cover, route change, and upward reveal.
 */
export function WishlistHeartPull({
  savedCount,
  className,
  isHome = false,
  isPastHero = false,
}: WishlistHeartPullProps) {
  const pathname = usePathname();
  const isFavouritesPage = pathname === "/favourites";

  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [tilt, setTilt] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const startPointerRef = useRef<{ x: number; y: number } | null>(null);
  const isArmedRef = useRef(false);
  const isCommittingRef = useRef(false);

  const rafRef = useRef<number>(0);
  const currentPullRef = useRef(0);
  const targetPullRef = useRef(0);
  const currentTiltRef = useRef(0);
  const targetTiltRef = useRef(0);

  // Remember the user's last visited route outside of /favourites
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname && pathname !== "/favourites") {
      const fullUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem("dochomoeo:fav-return-path", fullUrl);
    }
  }, [pathname]);

  // Determine target navigation destination dynamically
  const getTargetUrl = useCallback(() => {
    if (!isFavouritesPage) {
      return "/favourites";
    }
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("dochomoeo:fav-return-path");
      if (stored && stored !== "/favourites") return stored;
    }
    return "/";
  }, [isFavouritesPage]);

  // Buttery physical spring return loop
  const springTick = useCallback(() => {
    const diffPull = targetPullRef.current - currentPullRef.current;
    const diffTilt = targetTiltRef.current - currentTiltRef.current;

    currentPullRef.current += diffPull * 0.14;
    currentTiltRef.current += diffTilt * 0.14;

    setPullY(currentPullRef.current);
    setTilt(currentTiltRef.current);

    if (
      Math.abs(diffPull) > 0.04 ||
      Math.abs(diffTilt) > 0.04 ||
      startPointerRef.current !== null
    ) {
      rafRef.current = requestAnimationFrame(springTick);
    } else {
      currentPullRef.current = targetPullRef.current;
      currentTiltRef.current = targetTiltRef.current;
      setPullY(targetPullRef.current);
      setTilt(targetTiltRef.current);
      rafRef.current = 0;
    }
  }, []);

  const wakeSpring = useCallback(() => {
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(springTick);
    }
  }, [springTick]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Subtle downward affordance on hover when idle
  useEffect(() => {
    if (isDragging || isCommittingRef.current) return;
    targetPullRef.current = isHovered ? HOVER_EXTRA : 0;
    targetTiltRef.current = 0;
    wakeSpring();
  }, [isHovered, isDragging, wakeSpring]);

  const handlePointerDown = (event: PointerEvent<SVGGElement | SVGSVGElement | SVGRectElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (isCommittingRef.current) return;

    event.preventDefault();
    event.stopPropagation();

    try {
      svgRef.current?.setPointerCapture(event.pointerId);
    } catch {}

    startPointerRef.current = { x: event.clientX, y: event.clientY };
    isArmedRef.current = false;
    setIsDragging(true);

    targetPullRef.current = HOVER_EXTRA;
    targetTiltRef.current = 0;
    wakeSpring();
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!startPointerRef.current || isCommittingRef.current) return;

    const dy = Math.max(0, event.clientY - startPointerRef.current.y);
    const dx = event.clientX - startPointerRef.current.x;

    const pull = damp(dy, MAX_DRAG);
    const calculatedTilt = Math.max(-12, Math.min(12, dx * 0.18));

    targetPullRef.current = pull;
    targetTiltRef.current = calculatedTilt;
    wakeSpring();

    // Map pull directly to curtain transition progress (0 -> 1)
    const rawProgress = Math.min(1, pull / THRESHOLD);
    setInteractiveTransitionProgress(rawProgress);

    if (pull >= THRESHOLD) {
      if (!isArmedRef.current) {
        isArmedRef.current = true;
        haptic(14);
      }
    } else {
      isArmedRef.current = false;
    }
  };

  const handlePointerUp = () => {
    if (!startPointerRef.current) return;
    startPointerRef.current = null;
    setIsDragging(false);

    if (isArmedRef.current && !isCommittingRef.current) {
      isCommittingRef.current = true;
      isArmedRef.current = false;

      // Rest heart back smoothly
      targetPullRef.current = 0;
      targetTiltRef.current = 0;
      wakeSpring();

      // Commit synchronized full transition to destination (bidirectional)
      const targetDestination = getTargetUrl();
      commitInteractiveTransition(targetDestination);

      setTimeout(() => {
        isCommittingRef.current = false;
      }, 2200);
    } else {
      // Release below threshold: retract curtain back out, spring cord to rest
      targetPullRef.current = isHovered ? HOVER_EXTRA : 0;
      targetTiltRef.current = 0;
      wakeSpring();

      cancelInteractiveTransition();
    }
  };

  const handleKeyActivation = () => {
    if (isCommittingRef.current) return;
    isCommittingRef.current = true;
    haptic(12);

    targetPullRef.current = 14;
    wakeSpring();

    setTimeout(() => {
      targetPullRef.current = 0;
      wakeSpring();
      const targetDestination = getTargetUrl();
      commitInteractiveTransition(targetDestination);
    }, 120);

    setTimeout(() => {
      isCommittingRef.current = false;
    }, 2200);
  };

  // Dynamic coordinates
  const cordEndY = ANCHOR.y + REST_CORD + pullY;
  const heartCenterY = cordEndY + 10;

  const tooltipText = isFavouritesPage
    ? "Pull to return to previous page"
    : savedCount > 0
      ? `Pull to open favourites (${savedCount})`
      : "Pull to open favourites";

  const accessibleLabel = isFavouritesPage
    ? "Wishlist. Pull heart downward to return to previous page."
    : savedCount > 0
      ? `Wishlist: ${savedCount} saved remedies. Pull heart downward to view.`
      : "Wishlist. Pull heart downward to view favourites.";

  return (
    <div
      ref={containerRef}
      className={cn("group relative flex items-center justify-center select-none", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex items-center justify-center w-10 h-11">
        <svg
          ref={svgRef}
          aria-hidden="true"
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className={cn(
            "overflow-visible touch-none absolute top-[-4px] left-1/2 -translate-x-1/2",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          onLostPointerCapture={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <defs>
            {/* Rich Botanical Green Shaded Gradient */}
            <radialGradient id="botanical-heart" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#146d53" />
              <stop offset="65%" stopColor="#0d5a43" />
              <stop offset="100%" stopColor="#073b2c" />
            </radialGradient>

            {/* Subtle Drop Shadow */}
            <filter id="heart-soft-shadow" x="-30%" y="-25%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#0d5a43" floodOpacity="0.22" />
            </filter>
          </defs>

          {/* Extended Invisible Grab Target */}
          <rect
            x={4}
            y={0}
            width={36}
            height={REST_CORD + pullY + 28}
            fill="transparent"
            className={cn(!isDragging && "cursor-grab")}
            onPointerDown={handlePointerDown}
          />

          {/* 1. Top Mount Collar (Anchor) */}
          <rect
            x={ANCHOR.x - 3.5}
            y={ANCHOR.y}
            width={7}
            height={2.2}
            rx={1.1}
            className={cn(
              "transition-colors duration-200",
              !isPastHero && isHome ? "fill-white/80" : "fill-[#0d5a43]/70 dark:fill-emerald-400/70"
            )}
          />

          {/* 2. Fine Vertical Suspension Cord */}
          <line
            x1={ANCHOR.x}
            y1={ANCHOR.y + 2}
            x2={ANCHOR.x}
            y2={cordEndY}
            strokeWidth={1.25}
            strokeLinecap="round"
            className={cn(
              "transition-colors duration-150",
              isDragging || isHovered
                ? "stroke-[#0d5a43] dark:stroke-emerald-400"
                : !isPastHero && isHome
                  ? "stroke-white/80"
                  : "stroke-[#0d5a43]/65 dark:stroke-emerald-400/65"
            )}
          />

          {/* 3. Small Pull Collar Bead */}
          <circle
            cx={ANCHOR.x}
            cy={cordEndY}
            r={1.8}
            fill="#d4af37"
            stroke="#8c701c"
            strokeWidth={0.5}
          />

          {/* 4. Refined Botanical Green Heart Icon */}
          <g
            filter="url(#heart-soft-shadow)"
            transform={`translate(${ANCHOR.x} ${heartCenterY}) rotate(${tilt})`}
            className={cn(
              "transition-transform",
              !isDragging && "duration-200 ease-out",
              !isDragging && "cursor-grab"
            )}
            onPointerDown={handlePointerDown}
          >
            {/* Minimal Heart Silhouette */}
            <path
              d="M 0 -6 C -4 -11 -10.5 -9.2 -11.5 -4.5 C -12.5 1.5 -6 6.5 0 12 C 6 6.5 12.5 1.5 11.5 -4.5 C 10.5 -9.2 4 -11 0 -6 Z"
              fill="url(#botanical-heart)"
              stroke="#07382b"
              strokeWidth={0.75}
            />

            {/* Inner Curvature Specular Sheen */}
            <path
              d="M -7.5 -3.2 C -7 -6.5 -3.5 -7.5 0 -5.5"
              fill="none"
              stroke="#ffffff"
              strokeWidth={0.9}
              strokeLinecap="round"
              opacity={0.4}
            />

            {/* Saved Count Notification Pill (shown when not on /favourites) */}
            {savedCount > 0 && !isFavouritesPage && (
              <g transform="translate(8.5, -6.5)">
                <circle
                  r={5}
                  className="fill-[#e11d48] stroke-white dark:stroke-[#07130e] stroke-[1] shadow-xs"
                />
                <text
                  x={0}
                  y={2}
                  textAnchor="middle"
                  fontSize={6.5}
                  fontWeight="bold"
                  fill="#ffffff"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {savedCount > 9 ? "9+" : savedCount}
                </text>
              </g>
            )}

            {/* Indicator bead when on /favourites page */}
            {isFavouritesPage && (
              <circle
                cx={0}
                cy={1.5}
                r={1.4}
                className="fill-emerald-300 shadow-xs"
              />
            )}
          </g>
        </svg>

        {/* Accessible Keyboard Activation Trigger */}
        <button
          ref={buttonRef}
          type="button"
          aria-label={accessibleLabel}
          className="sr-only focus:not-sr-only focus:absolute focus:inset-0 focus:z-50 focus:rounded-full focus:ring-2 focus:ring-[#0d5a43] focus:outline-none cursor-pointer"
          onClick={handleKeyActivation}
        />
      </div>

      {/* Elegant Desktop Tooltip Affordance */}
      <div
        className={cn(
          "pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-full",
          "bg-white/90 dark:bg-[#0c1f18]/95 backdrop-blur-md shadow-md border border-black/8 dark:border-white/10",
          "text-[10px] font-semibold text-[#0d5a43] dark:text-emerald-400 whitespace-nowrap",
          "transition-all duration-200",
          isHovered && !isDragging
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-1 pointer-events-none"
        )}
      >
        {tooltipText}
      </div>
    </div>
  );
}

// Backward compatibility alias
export { WishlistHeartPull as WishlistPullCord };
