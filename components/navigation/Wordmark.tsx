"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_GIF = "/Images/LogoGIF/dochomoeo_logo_animation.gif";
const LOGO_STATIC = "/Images/LogoGIF/dochomoeo_logo_final_frame.png";
const LOGO_ANIMATION_DURATION_MS = 8390; // Exact duration of 29 frames in the logo GIF

/**
 * DocHomoeo Brand Logo:
 * - Plays the official dochomoeo_logo_animation.gif from start to end once.
 * - When playback finishes, smoothly halts on the final frame (dochomoeo_logo_final_frame.png).
 * - Avoids restarting the intro animation on session reloads or navigation.
 * - Activates a sleek glassy shining effect that sweeps across the logo every 2 seconds.
 */
export function Wordmark({
  className,
  tone = "light",
  showTagline = true,
  isNavVisible = true,
}: {
  className?: string;
  tone?: "light" | "dark";
  showTagline?: boolean;
  isNavVisible?: boolean;
}) {
  const isDark = tone === "dark";
  const [isCompleted, setIsCompleted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [gifSrc, setGifSrc] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    let alreadyCompleted = false;
    try {
      const currentBuild = process.env.NEXT_PUBLIC_BUILD_TIME;
      if (currentBuild) {
        const storedBuild = sessionStorage.getItem("dochomoeo_logo_build_time");
        if (storedBuild !== currentBuild) {
          sessionStorage.removeItem("dochomoeo_logo_completed");
          sessionStorage.setItem("dochomoeo_logo_build_time", currentBuild);
        }
      }
      alreadyCompleted = sessionStorage.getItem("dochomoeo_logo_completed") === "true";
    } catch {}

    if (alreadyCompleted) {
      setIsCompleted(true);
      return;
    }

    // Only initiate GIF animation once the navbar is actually visible to the user
    if (!isNavVisible) return;

    // Slight ~180ms delay to sync with the navbar slide-down entrance
    const startTimer = setTimeout(() => {
      setGifSrc(`${LOGO_GIF}?start=${Date.now()}`);

      const endTimer = setTimeout(() => {
        setIsCompleted(true);
        try {
          sessionStorage.setItem("dochomoeo_logo_completed", "true");
        } catch {}
      }, LOGO_ANIMATION_DURATION_MS);

      return () => clearTimeout(endTimer);
    }, 180);

    return () => clearTimeout(startTimer);
  }, [isNavVisible]);

  return (
    <Link
      href="/"
      aria-label="DocHomoeo — Heal Naturally"
      className={cn(
        "group relative inline-flex items-center select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5a43]/50 rounded-xl",
        isDark && "focus-visible:ring-cream/60",
        className
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.03]",
          isDark
            ? "bg-white/95 backdrop-blur-md rounded-xl px-2.5 py-1 shadow-sm border border-white/30"
            : ""
        )}
      >
        {/* Logo Container holding both GIF and Final Frame - scaled up for maximum visibility without increasing navbar height */}
        <div className="relative h-[56px] sm:h-[62px] aspect-[890/560] overflow-hidden scale-[1.08] sm:scale-[1.16] origin-left">
          {/* Animated GIF: only loads and plays from start when the navbar animates into view */}
          {mounted && !isCompleted && gifSrc && (
            <img
              src={gifSrc}
              alt="DocHomoeo Logo"
              width={890}
              height={560}
              className={cn(
                "h-full w-full object-contain pointer-events-none select-none transition-opacity duration-300",
                isCompleted ? "opacity-0" : "opacity-100"
              )}
            />
          )}

          {/* Static Final Frame: displayed once completed to prevent replaying from start */}
          {mounted && isCompleted && (
            <img
              src={LOGO_STATIC}
              alt="DocHomoeo"
              width={890}
              height={560}
              className="absolute inset-0 h-full w-full object-contain pointer-events-none select-none"
            />
          )}

          {/* Glassy Specular Shine Effect — activates once logo finishes and repeats every 2 seconds */}
          {mounted && isCompleted && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{
                WebkitMaskImage: `url('${LOGO_STATIC}')`,
                maskImage: `url('${LOGO_STATIC}')`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            >
              <span className="logo-shine-beam absolute inset-y-0 w-2/5 bg-gradient-to-r from-transparent via-white/85 to-transparent pointer-events-none" />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

