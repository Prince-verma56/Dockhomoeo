"use client";

/**
 * @author: @dorianbaffier (Extended for DocHomoeo)
 * @description: Bell Button with physics pendulum simulation & brand palette
 * @version: 1.1.0
 * @website: https://kokonutui.com
 */

import {
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

// The bell and its clapper are two pendulums on the same pivot.
const STEP = 1 / 240;
const BELL_STIFFNESS = 380;
const BELL_DAMPING = 5;
const CLAPPER_STIFFNESS = 150;
const CLAPPER_DAMPING = 4;
const LIP = 13;
const RESTITUTION = 0.45;
const RECOIL = 0.18;
const STRIKE_SPEED = 260;
const RING_KICK = 600;
const NUDGE_KICK = 160;
const MUTE_KICK = 300;
const REST = 0.05;
const PIVOT = { x: 12, y: 2.5 };
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

function haptic(ms: number) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(ms);
  }
}

/** A number whose digits roll to their new value, like an odometer counter. */
function RollingNumber({ value }: { value: number }) {
  const text = value.toLocaleString("en-US");
  return (
    <span aria-hidden="true" className="inline-flex tabular-nums">
      {text.split("").map((char, i) => {
        const key = text.length - i;
        if (char < "0" || char > "9") {
          return <span key={key}>{char}</span>;
        }
        const digit = Number(char);
        return (
          <span className="relative inline-block h-5 overflow-hidden" key={key}>
            <span
              className="flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
              style={{ transform: `translateY(${-digit * 10}%)` }}
            >
              {"0123456789".split("").map((d) => (
                <span className="h-5 leading-5" key={d}>
                  {d}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export interface BellButtonProps {
  /** `default` shows the label and count, `compact` the label, `icon` the icon alone. */
  variant?: "default" | "compact" | "icon";
  /** Controlled state. */
  subscribed?: boolean;
  defaultSubscribed?: boolean;
  onSubscribedChange?: (subscribed: boolean) => void;
  /** Subscribers, not counting this one. */
  count?: number;
  label?: string;
  subscribedLabel?: string;
  /** Theme palette matching DocHomoeo surfaces */
  tone?: "forest" | "dark" | "default";
  /** Icon representation with physics pendulum effect */
  iconType?: "bell" | "heart" | "bookmark";
  className?: string;
}

export function BellButton({
  variant = "default",
  subscribed: subscribedProp,
  defaultSubscribed = false,
  onSubscribedChange,
  count = 1284,
  label = "Notify me",
  subscribedLabel = "Subscribed",
  tone = "forest",
  iconType = "bell",
  className,
}: BellButtonProps) {
  const [internal, setInternal] = useState(defaultSubscribed);
  const subscribed = subscribedProp ?? internal;

  const bellRef = useRef<SVGGElement>(null);
  const clapperRef = useRef<SVGPathElement>(null);
  const leftWaveRef = useRef<SVGPathElement>(null);
  const rightWaveRef = useRef<SVGPathElement>(null);

  const sim = useRef({
    bell: 0,
    bellSpeed: 0,
    clapper: 0,
    clapperSpeed: 0,
    muffled: false,
    raf: 0,
    last: 0,
    carry: 0,
    lastNudge: 0,
    reduceMotion: false,
  });

  const draw = useCallback(() => {
    const s = sim.current;
    bellRef.current?.setAttribute(
      "transform",
      `rotate(${s.bell.toFixed(2)} ${PIVOT.x} ${PIVOT.y})`
    );
    clapperRef.current?.setAttribute(
      "transform",
      `rotate(${s.clapper.toFixed(2)} ${PIVOT.x} ${PIVOT.y})`
    );
  }, []);

  const flare = useCallback((side: 1 | -1, strength: number) => {
    const wave = side > 0 ? rightWaveRef.current : leftWaveRef.current;
    if (!wave?.animate) {
      return;
    }
    const peak = Math.min(1, 0.45 + strength * 0.55);
    wave.animate(
      [
        { opacity: peak, transform: "translateX(0px)" },
        { opacity: 0, transform: `translateX(${side * 3}px)` },
      ],
      { duration: 420, easing: EASE_OUT }
    );
  }, []);

  const step = useCallback(() => {
    const s = sim.current;
    s.bellSpeed +=
      (-s.bell * BELL_STIFFNESS - s.bellSpeed * BELL_DAMPING) * STEP;
    s.bell += s.bellSpeed * STEP;
    if (s.muffled) {
      s.clapper = s.bell;
      s.clapperSpeed = s.bellSpeed;
      return;
    }
    s.clapperSpeed +=
      (-s.clapper * CLAPPER_STIFFNESS - s.clapperSpeed * CLAPPER_DAMPING) *
      STEP;
    s.clapper += s.clapperSpeed * STEP;
    const relative = s.clapper - s.bell;
    if (Math.abs(relative) <= LIP) {
      return;
    }
    const side = relative > 0 ? 1 : -1;
    const impact = (s.clapperSpeed - s.bellSpeed) * side;
    s.clapper = s.bell + side * LIP;
    if (impact <= 0) {
      return;
    }
    s.clapperSpeed -= side * impact * (1 + RESTITUTION);
    s.bellSpeed += side * impact * RECOIL;
    if (impact > STRIKE_SPEED) {
      flare(side as 1 | -1, impact / 1600);
      haptic(6);
    }
  }, [flare]);

  const tick = useCallback(
    (now: number) => {
      const s = sim.current;
      s.raf = 0;
      const elapsed = s.last ? Math.min((now - s.last) / 1000, 0.05) : STEP;
      s.last = now;
      s.carry += elapsed;
      while (s.carry >= STEP) {
        step();
        s.carry -= STEP;
      }
      draw();
      const energy =
        Math.abs(s.bell) +
        Math.abs(s.bellSpeed) * 0.02 +
        Math.abs(s.clapper) +
        Math.abs(s.clapperSpeed) * 0.02;
      if (energy < REST) {
        s.bell = 0;
        s.bellSpeed = 0;
        s.clapper = 0;
        s.clapperSpeed = 0;
        s.last = 0;
        draw();
        return;
      }
      s.raf = requestAnimationFrame(tick);
    },
    [draw, step]
  );

  const kick = useCallback(
    (speed: number) => {
      const s = sim.current;
      if (s.reduceMotion) {
        return;
      }
      s.bellSpeed += speed;
      if (!s.raf) {
        s.raf = requestAnimationFrame(tick);
      }
    },
    [tick]
  );

  useEffect(() => {
    const s = sim.current;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    s.reduceMotion = query.matches;
    const onChange = () => {
      s.reduceMotion = query.matches;
    };
    query.addEventListener("change", onChange);
    return () => {
      query.removeEventListener("change", onChange);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, []);

  const handleClick = () => {
    const next = !subscribed;
    if (subscribedProp === undefined) {
      setInternal(next);
    }
    onSubscribedChange?.(next);
    const s = sim.current;
    if (next) {
      s.muffled = false;
      kick(s.bellSpeed >= 0 ? RING_KICK : -RING_KICK);
      if (s.reduceMotion) {
        flare(1, 0.6);
        flare(-1, 0.6);
      }
      haptic(10);
    } else {
      s.muffled = true;
      kick(-MUTE_KICK);
    }
  };

  const handlePointerEnter = (event: PointerEvent) => {
    const s = sim.current;
    if (event.pointerType !== "mouse" || s.muffled) {
      return;
    }
    if (event.timeStamp - s.lastNudge < 700) {
      return;
    }
    s.lastNudge = event.timeStamp;
    kick(s.bellSpeed >= 0 ? NUDGE_KICK : -NUDGE_KICK);
  };

  useEffect(() => {
    sim.current.muffled = !subscribed;
  }, [subscribed]);

  // Tone color styling
  const toneClasses = {
    forest: subscribed
      ? "border-forest bg-forest text-white hover:bg-forest-deep active:bg-forest-deep shadow-xs"
      : "border-line bg-paper text-ink hover:border-forest/40 hover:text-forest active:bg-canvas shadow-2xs",
    dark: subscribed
      ? "border-forest bg-forest text-cream hover:bg-forest-deep active:bg-forest-abyss shadow-xs"
      : "border-white/15 bg-white/6 text-cream hover:border-white/35 hover:bg-white/10 active:bg-white/15",
    default: subscribed
      ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-700"
      : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 active:bg-zinc-100",
  }[tone];

  const counterClasses = {
    forest: subscribed
      ? "bg-white/20 text-white"
      : "bg-forest/10 text-forest font-semibold",
    dark: subscribed
      ? "bg-white/20 text-cream"
      : "bg-white/12 text-cream/80",
    default: subscribed
      ? "bg-white/15 text-white/80"
      : "bg-zinc-100 text-zinc-500",
  }[tone];

  return (
    <button
      aria-label={variant === "icon" ? label : undefined}
      aria-pressed={subscribed}
      className={cn(
        "inline-flex h-11 select-none items-center gap-2.5 rounded-full border font-medium text-sm outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 cursor-pointer",
        variant === "default" && "pr-2 pl-4",
        variant === "compact" && "px-4",
        variant === "icon" && "w-11 justify-center",
        toneClasses,
        className
      )}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="size-5 overflow-visible shrink-0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          className="opacity-0"
          d="M21.5 4.5c1.2 1.6 1.8 3.4 1.8 5.5"
          ref={rightWaveRef}
        />
        <path
          className="opacity-0"
          d="M2.5 4.5C1.3 6.1.7 7.9.7 10"
          ref={leftWaveRef}
        />
        {iconType === "bell" ? (
          <path d="M10.27 21a2 2 0 0 0 3.46 0" ref={clapperRef} />
        ) : null}

        <g ref={bellRef}>
          {iconType === "bell" ? (
            <>
              <path
                className={cn(
                  "transition-[fill] duration-200 ease-out",
                  subscribed ? "fill-current" : "fill-transparent"
                )}
                d="M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.96 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.41 5.96-2.74 7.33"
              />
              <path
                className="transition-[stroke-dashoffset] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
                d="M3 3l18 18"
                strokeDasharray="26"
                strokeDashoffset={subscribed ? 26 : 0}
              />
            </>
          ) : iconType === "heart" ? (
            <path
              className={cn(
                "transition-[fill,color] duration-200 ease-out",
                subscribed ? "fill-current text-[#e11d48]" : "fill-transparent"
              )}
              d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
            />
          ) : (
            <path
              className={cn(
                "transition-[fill] duration-200 ease-out",
                subscribed ? "fill-current" : "fill-transparent"
              )}
              d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"
            />
          )}
        </g>
      </svg>

      {variant === "icon" ? null : (
        <span className="relative grid">
          {[
            { key: "off", on: !subscribed, text: label },
            { key: "on", on: subscribed, text: subscribedLabel },
          ].map((line) => (
            <span
              aria-hidden={!line.on}
              className={cn(
                "col-start-1 row-start-1 whitespace-nowrap transition-[opacity,filter] duration-200 ease-out",
                line.on ? "opacity-100 blur-0" : "opacity-0 blur-[2px]"
              )}
              key={line.key}
            >
              {line.text}
            </span>
          ))}
        </span>
      )}

      {variant === "default" ? (
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs transition-colors duration-200 ease-out",
            counterClasses
          )}
        >
          <RollingNumber value={count + (subscribed ? 1 : 0)} />
          <span className="sr-only">
            {(count + (subscribed ? 1 : 0)).toLocaleString("en-US")} subscribers
          </span>
        </span>
      ) : null}
    </button>
  );
}

export default BellButton;
