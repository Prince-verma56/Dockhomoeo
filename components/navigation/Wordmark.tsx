"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_GIF = "/Images/LogoGIF/dochomoeo_logo_animation.gif";
const LOGO_STATIC = "/Images/LogoGIF/dochomoeo_logo_final_frame.png";
const LOGO_DARK = "/Images/LogoGIF/dochomoeo_logo_dark.png";

// Exact duration of 29 frames in the logo GIF (8.39s)
const LOGO_ANIMATION_DURATION_MS = 8390;
// Glassy specular shine sweep duration (1.5s)
const SHINE_DURATION_MS = 1500;
// Inter-cycle delay after shining finishes before replaying GIF (5.0s)
const PAUSE_DURATION_MS = 5000;

/**
 * DocHomoeo Brand Logo:
 * - Plays the official dochomoeo_logo_animation.gif from start to end in the navbar.
 * - When playback finishes, immediately plays a glassy specular shine sweep across the logo for 1.5s.
 * - After shining finishes, pauses for 5 seconds.
 * - Then cleanly repeats: plays the GIF animation from frame 0 -> 1.5s shine -> 5s pause -> repeat.
 * - For dark footers (tone="dark"), cleanly displays dochomoeo_logo_dark.png with zero GIF overhead.
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
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<"gif" | "shine" | "pause">("gif");
  const [gifKey, setGifKey] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    setGifKey(Date.now());
  }, []);

  useEffect(() => {
    if (!mounted || isDark || !isNavVisible) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    if (stage === "gif") {
      // 1. Play GIF for full animation duration (8390ms)
      timerRef.current = setTimeout(() => {
        setStage("shine");
      }, LOGO_ANIMATION_DURATION_MS);
    } else if (stage === "shine") {
      // 2. Play glassy shining effect for 1.5 seconds (1500ms)
      timerRef.current = setTimeout(() => {
        setStage("pause");
      }, SHINE_DURATION_MS);
    } else if (stage === "pause") {
      // 3. Pause for 5 seconds (5000ms), then replay GIF from frame 0
      timerRef.current = setTimeout(() => {
        setGifKey(Date.now());
        setStage("gif");
      }, PAUSE_DURATION_MS);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stage, mounted, isDark, isNavVisible]);

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
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.03]">
        {/* Logo Container holding GIF, Final Frame, and Specular Shine */}
        <div className="relative h-[56px] sm:h-[62px] aspect-[890/560] overflow-hidden scale-[1.08] sm:scale-[1.16] origin-left">
          {/* Dark Footer Variant: Pure transparent PNG with crisp contrast and no background block */}
          {isDark ? (
            <img
              src={LOGO_DARK}
              alt="DocHomoeo"
              width={890}
              height={560}
              className="h-full w-full object-contain pointer-events-none select-none drop-shadow-sm"
            />
          ) : (
            <>
              {/* Animated GIF: ONLY image rendered during the 'gif' stage */}
              {mounted && stage === "gif" && gifKey > 0 && (
                <img
                  key={gifKey}
                  src={`${LOGO_GIF}?t=${gifKey}`}
                  alt="DocHomoeo Logo Animation"
                  width={890}
                  height={560}
                  className="h-full w-full object-contain pointer-events-none select-none"
                />
              )}

              {/* Static Final Frame: Rendered ONLY when GIF has completed (during 'shine' and 'pause') */}
              {mounted && stage !== "gif" && (
                <div className="relative size-full">
                  <img
                    src={LOGO_STATIC}
                    alt="DocHomoeo"
                    width={890}
                    height={560}
                    className="h-full w-full object-contain pointer-events-none select-none"
                  />

                  {/* Glassy Specular Shine Effect: Sweeps for 1.5s immediately over the static image */}
                  {stage === "shine" && (
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
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
