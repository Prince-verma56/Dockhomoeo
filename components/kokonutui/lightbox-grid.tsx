"use client";

/**
 * @author: @dorianbaffier
 * @description: Lightbox Grid
 * @version: 1.0.0
 * @date: 2026-10-15
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import {
  animate,
  type MotionValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Link001 } from "@/components/ui/skiper-ui/skiper40";
import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { getLenis } from "@/components/providers/SmoothScrollProvider";

export interface LightboxImage {
  src: string;
  alt: string;
  /** Natural size, used to fit the open view without waiting for a load. */
  width: number;
  height: number;
  caption?: string;
  // Remedy form collection properties
  form?: string;
  name?: string;
  tagline?: string | null;
  count?: number | null;
  position?: string;
}

export interface LightboxGridProps {
  images?: LightboxImage[];
  items?: LightboxImage[];
  className?: string;
}

const unsplash = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

const DEFAULT_IMAGES: LightboxImage[] = [
  {
    src: unsplash("1501785888041-af3ef285b470", 1600, 1067),
    alt: "A lake below mountains",
    width: 1600,
    height: 1067,
    caption: "Lake shore, early morning",
  },
  {
    src: unsplash("1506905925346-21bda4d32df4", 1200, 1600),
    alt: "Peaks above the clouds",
    width: 1200,
    height: 1600,
    caption: "Above the cloud line",
  },
  {
    src: unsplash("1470071459604-3b5ec3a7fe05", 1600, 1067),
    alt: "Misty hills",
    width: 1600,
    height: 1067,
    caption: "Fog over the hills",
  },
  {
    src: unsplash("1441974231531-c6227db76b6e", 1200, 1600),
    alt: "Light through a forest",
    width: 1200,
    height: 1600,
    caption: "Forest, late afternoon",
  },
  {
    src: unsplash("1469474968028-56623f02e42e", 1600, 1067),
    alt: "Sun setting over a valley",
    width: 1600,
    height: 1067,
    caption: "Valley at sunset",
  },
  {
    src: unsplash("1433086966358-54859d0ed716", 1200, 1600),
    alt: "A waterfall",
    width: 1200,
    height: 1600,
    caption: "Waterfall after rain",
  },
];

const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];
const OPEN = { type: "spring", duration: 0.5, bounce: 0.12 } as const;
const CLOSE = { type: "spring", duration: 0.42, bounce: 0.08 } as const;
const SETTLE = { type: "spring", duration: 0.35, bounce: 0.2 } as const;
// The open image keeps this much room around it, and below for the caption.
const MARGIN = 48;
const MARGIN_SMALL = 12;
const CAPTION_ROOM = 88;
const OPEN_RADIUS = 16;
// Drag thresholds: distance in px, speed in px/ms.
const DISMISS_DISTANCE = 110;
const DISMISS_SPEED = 0.55;
const SWIPE_SPEED = 0.45;
const AXIS_LOCK = 6;

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Frame {
  x: number;
  y: number;
  scale: number;
  clip: string;
}

/** Where an image of this size sits when open, fitted to the window. */
function fitRect(image: LightboxImage): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = vw < 640 ? MARGIN_SMALL : MARGIN;
  const maxW = vw - margin * 2;
  const maxH = vh - margin * 2 - CAPTION_ROOM;
  const scale = Math.min(maxW / image.width, maxH / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  return {
    left: (vw - width) / 2,
    top: (vh - CAPTION_ROOM - height) / 2,
    width,
    height,
  };
}

const openClip = () => `inset(0px 0px 0px 0px round ${OPEN_RADIUS}px)`;

/**
 * The transform and crop that make the open image look exactly like its
 * thumbnail: scaled down to the thumbnail's cover size, moved onto it, and
 * cropped to its box.
 */
function thumbFrame(
  open: Rect,
  thumb: DOMRect,
  image: LightboxImage,
  radius: number
): Frame {
  const imageRatio = image.width / image.height;
  const thumbRatio = thumb.width / thumb.height;
  const coverWidth =
    imageRatio > thumbRatio ? thumb.height * imageRatio : thumb.width;
  const scale = coverWidth / open.width;
  const insetX = (open.width - thumb.width / scale) / 2;
  const insetY = (open.height - thumb.height / scale) / 2;
  return {
    x: thumb.left + thumb.width / 2 - (open.left + open.width / 2),
    y: thumb.top + thumb.height / 2 - (open.top + open.height / 2),
    scale,
    clip: `inset(${insetY}px ${insetX}px ${insetY}px ${insetX}px round ${radius / scale}px)`,
  };
}

function isVisible(rect: DOMRect) {
  return (
    rect.bottom > 0 &&
    rect.top < window.innerHeight &&
    rect.right > 0 &&
    rect.left < window.innerWidth
  );
}

function IconButton({
  label,
  onClick,
  className,
  children,
  buttonRef,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
  buttonRef?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "flex size-10 items-center justify-center rounded-full bg-white/80 text-zinc-700 shadow-sm border border-black/[0.07] backdrop-blur-xl transition-all duration-150 hover:bg-white hover:text-zinc-950 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-forest/60 disabled:pointer-events-none disabled:opacity-30 cursor-pointer",
        className
      )}
      onClick={onClick}
      ref={buttonRef}
      type="button"
    >
      {children}
    </button>
  );
}

function Chevron({ flip }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("size-4", flip && "rotate-180")}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="m6 3.5 4.5 4.5L6 12.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

interface ViewerProps {
  images: LightboxImage[];
  index: number;
  rect: Rect;
  x: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  clip: MotionValue<string>;
  alpha: MotionValue<number>;
  fade: MotionValue<number>;
  settled: boolean;
  onClose: (velocity?: { x: number; y: number }) => void;
  onStep: (direction: 1 | -1) => void;
}

function Viewer({
  images,
  index,
  rect,
  x,
  y,
  scale,
  clip,
  alpha,
  fade,
  settled,
  onClose,
  onStep,
}: ViewerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: number;
    startX: number;
    startY: number;
    axis: "x" | "y" | null;
    samples: { x: number; y: number; t: number }[];
  } | null>(null);
  const backdrop = useTransform(fade, (v) => v);
  const image = images[index];
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!settled || event.button !== 0) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      axis: null,
      samples: [{ x: event.clientX, y: event.clientY, t: event.timeStamp }],
    };
  };

  const followVertical = (dx: number, dy: number) => {
    const pull = Math.min(Math.abs(dy) / window.innerHeight, 1);
    x.set(dx);
    y.set(dy);
    scale.set(1 - pull * 0.45);
    fade.set(1 - Math.min(Math.abs(dy) / 360, 1) * 0.85);
  };

  const followHorizontal = (dx: number) => {
    const blocked = (dx > 0 && !hasPrev) || (dx < 0 && !hasNext);
    x.set(blocked ? dx * 0.25 : dx);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) {
      return;
    }
    const dx = event.clientX - d.startX;
    const dy = event.clientY - d.startY;
    if (!d.axis) {
      if (Math.hypot(dx, dy) < AXIS_LOCK) {
        return;
      }
      d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    d.samples.push({ x: event.clientX, y: event.clientY, t: event.timeStamp });
    if (d.samples.length > 5) {
      d.samples.shift();
    }
    if (d.axis === "y") {
      followVertical(dx, dy);
    } else {
      followHorizontal(dx);
    }
  };

  const releaseVertical = (dy: number, velocity: { x: number; y: number }) => {
    if (
      Math.abs(dy) > DISMISS_DISTANCE ||
      Math.abs(velocity.y) > DISMISS_SPEED
    ) {
      onClose(velocity);
      return;
    }
    animate(x, 0, SETTLE);
    animate(y, 0, SETTLE);
    animate(scale, 1, SETTLE);
    animate(fade, 1, { duration: 0.2, ease: EASE });
  };

  const releaseHorizontal = (dx: number, vx: number) => {
    const far = Math.abs(dx) > rect.width * 0.22 || Math.abs(vx) > SWIPE_SPEED;
    if (far && dx < 0 && hasNext) {
      onStep(1);
    } else if (far && dx > 0 && hasPrev) {
      onStep(-1);
    } else {
      animate(x, 0, SETTLE);
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) {
      return;
    }
    drag.current = null;
    const first = d.samples[0];
    const last = d.samples.at(-1) ?? first;
    const dt = Math.max(1, last.t - first.t);
    const velocity = { x: (last.x - first.x) / dt, y: (last.y - first.y) / dt };
    if (d.axis === "y") {
      releaseVertical(event.clientY - d.startY, velocity);
    } else if (d.axis === "x") {
      releaseHorizontal(event.clientX - d.startX, velocity.x);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowRight" && hasNext) {
      onStep(1);
    } else if (event.key === "ArrowLeft" && hasPrev) {
      onStep(-1);
    } else if (event.key === "Tab") {
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLButtonElement>(
          "button:not(:disabled), a"
        ) ?? []
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  };

  return (
    <div
      aria-label={image.caption ?? image.alt}
      aria-modal="true"
      className="fixed inset-0 z-[100]"
      onKeyDown={handleKeyDown}
      ref={dialogRef}
      role="dialog"
    >
      {/* Apple-style Frosted Glassmorphism Backdrop */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-white/65 backdrop-blur-3xl backdrop-saturate-150"
        onClick={() => onClose()}
        style={{ opacity: backdrop }}
      />

      {/* Animated Lightbox Image Card */}
      <motion.div
        className="absolute cursor-grab touch-none select-none overflow-hidden rounded-[1.5rem] shadow-[0_24px_70px_-12px_rgba(0,0,0,0.22)] border border-black/[0.08] active:cursor-grabbing"
        onLostPointerCapture={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          x,
          y,
          scale,
          clipPath: clip,
          opacity: alpha,
          willChange: "transform, clip-path",
        }}
      >
        <Image
          alt={image.alt}
          className="pointer-events-none select-none h-full w-full object-cover"
          draggable={false}
          height={image.height}
          src={image.src}
          unoptimized
          width={image.width}
        />
      </motion.div>

      {/* Floating Controls & Info */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ opacity: fade }}
      >
        {/* Top bar with Apple-like counter and close pill */}
        <div className="pointer-events-auto absolute top-4 right-4 flex items-center gap-2.5 sm:top-6 sm:right-6">
          <span className="rounded-full bg-white/85 border border-black/[0.07] px-3.5 py-1.5 text-xs font-semibold text-zinc-700 backdrop-blur-xl shadow-xs tabular-nums">
            {index + 1} / {images.length}
          </span>
          <IconButton
            buttonRef={closeRef}
            label="Close"
            onClick={() => onClose()}
          >
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              viewBox="0 0 16 16"
            >
              <path
                d="m4 4 8 8M12 4l-8 8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            </svg>
          </IconButton>
        </div>

        {/* Previous & Next navigation buttons */}
        <IconButton
          className="pointer-events-auto absolute top-1/2 left-4 hidden -translate-y-1/2 sm:flex size-11"
          label="Previous photo"
          onClick={() => hasPrev && onStep(-1)}
        >
          <Chevron flip />
        </IconButton>
        <IconButton
          className="pointer-events-auto absolute top-1/2 right-4 hidden -translate-y-1/2 sm:flex size-11"
          label="Next photo"
          onClick={() => hasNext && onStep(1)}
        >
          <Chevron />
        </IconButton>

        {/* Bottom Caption, Count Badge & Direct Shop Link */}
        <div
          className="pointer-events-auto absolute inset-x-4 flex flex-col items-center justify-center gap-2 text-center"
          style={{ top: Math.min(window.innerHeight - 84, rect.top + rect.height + 14) }}
        >
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            <span className="font-semibold text-zinc-900 text-base sm:text-lg tracking-tight">
              {image.name || image.caption || image.alt}
            </span>
            {image.count !== null && image.count !== undefined ? (
              <span className="rounded-full bg-black/[0.05] border border-black/[0.07] px-2.5 py-0.5 text-xs font-semibold text-zinc-700 backdrop-blur-sm">
                {image.count} {image.count === 1 ? "product" : "products"}
              </span>
            ) : null}
          </div>
          {image.tagline ? (
            <p className="text-xs sm:text-sm text-zinc-600 max-w-lg font-normal">
              {image.tagline}
            </p>
          ) : null}
          {image.form ? (
            <Link001
              href={`/products?form=${image.form}`}
              onClick={() => onClose()}
              tone="forest"
              className="mt-2 text-xs sm:text-sm font-semibold tracking-wide py-0.5"
            >
              Shop {image.name || "remedies"}
            </Link001>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Kokonut UI LightboxGrid customized to preserve DocHomoeo's lead-and-quad
 * featured form collection layout with buttery spring expansion animations.
 */
export default function LightboxGrid({
  images,
  items,
  className,
}: LightboxGridProps) {
  const cardList: LightboxImage[] = items ?? images ?? DEFAULT_IMAGES;

  const [active, setActive] = useState<number | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [settled, setSettled] = useState(false);
  const [closing, setClosing] = useState(false);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const clip = useMotionValue(openClip());
  const alpha = useMotionValue(1);
  const fade = useMotionValue(0);

  const frameFor = useCallback(
    (index: number, open: Rect): Frame | null => {
      const thumb = thumbs.current[index];
      if (!thumb) {
        return null;
      }
      const box = thumb.getBoundingClientRect();
      if (!isVisible(box)) {
        return null;
      }
      const radius =
        Number.parseFloat(getComputedStyle(thumb).borderTopLeftRadius) || 24;
      return thumbFrame(open, box, cardList[index], radius);
    },
    [cardList]
  );

  const open = useCallback(
    (index: number) => {
      const target = fitRect(cardList[index]);
      const from = frameFor(index, target);
      setActive(index);
      setRect(target);
      setClosing(false);
      setSettled(false);
      alpha.set(1);
      if (!from || reduceMotion) {
        x.set(0);
        y.set(0);
        scale.set(1);
        clip.set(openClip());
        fade.set(0);
        alpha.set(0);
        animate(alpha, 1, { duration: 0.18 });
        animate(fade, 1, { duration: 0.18 }).then(() => setSettled(true));
        return;
      }
      x.set(from.x);
      y.set(from.y);
      scale.set(from.scale);
      clip.set(from.clip);
      fade.set(0);
      animate(x, 0, OPEN);
      animate(y, 0, OPEN);
      animate(scale, 1, OPEN);
      animate(clip, openClip(), OPEN);
      animate(fade, 1, { duration: 0.3, ease: EASE }).then(() =>
        setSettled(true)
      );
    },
    [alpha, clip, fade, frameFor, cardList, reduceMotion, scale, x, y]
  );

  const close = useCallback(
    (velocity?: { x: number; y: number }) => {
      if (active === null || !rect || closing) {
        return;
      }
      setClosing(true);
      const index = active;
      thumbs.current[index]?.scrollIntoView({
        behavior: "instant",
        block: "nearest",
        inline: "nearest",
      });
      const to = frameFor(index, rect);
      const finish = () => {
        setActive(null);
        setRect(null);
        setClosing(false);
        thumbs.current[index]?.focus({ preventScroll: true });
      };
      if (!to || reduceMotion) {
        animate(alpha, 0, { duration: 0.16 });
        animate(fade, 0, { duration: 0.16 }).then(finish);
        return;
      }
      const vx = (velocity?.x ?? 0) * 1000;
      const vy = (velocity?.y ?? 0) * 1000;
      animate(x, to.x, { ...CLOSE, velocity: vx });
      animate(y, to.y, { ...CLOSE, velocity: vy });
      animate(scale, to.scale, CLOSE);
      animate(clip, to.clip, CLOSE);
      animate(fade, 0, { duration: 0.28, ease: EASE });
      window.setTimeout(finish, 420);
    },
    [
      active,
      alpha,
      clip,
      closing,
      fade,
      frameFor,
      rect,
      reduceMotion,
      scale,
      x,
      y,
    ]
  );

  const step = useCallback(
    (direction: 1 | -1) => {
      if (active === null) {
        return;
      }
      const next = active + direction;
      if (next < 0 || next >= cardList.length) {
        return;
      }
      setActive(next);
      setRect(fitRect(cardList[next]));
      y.set(0);
      scale.set(1);
      clip.set(openClip());
      fade.set(1);
      if (reduceMotion) {
        x.set(0);
        alpha.set(1);
        return;
      }
      x.set(direction * 72);
      alpha.set(0);
      animate(x, 0, { duration: 0.32, ease: EASE });
      animate(alpha, 1, { duration: 0.22, ease: EASE });
    },
    [active, alpha, clip, fade, cardList, reduceMotion, scale, x, y]
  );

  // Lock the page behind the viewer, pause smooth scrolling, and keep fitted on resize
  useEffect(() => {
    if (active === null) {
      return;
    }
    const lenis = getLenis();
    lenis?.stop();

    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";

    const onResize = () => setRect(fitRect(cardList[active]));
    window.addEventListener("resize", onResize);

    return () => {
      root.style.overflow = previous;
      window.removeEventListener("resize", onResize);
      lenis?.start();
    };
  }, [active, cardList]);

  // Lead-and-quad layout if 5 items (or fallback to custom responsive grid)
  const isFeaturedCollection = cardList.length === 5;
  const leadCard = isFeaturedCollection ? cardList[0] : null;
  const restCards = isFeaturedCollection ? cardList.slice(1) : cardList;

  const renderCard = (card: LightboxImage, index: number, isLead = false) => {
    return (
      <div
        className={cn(
          "group relative isolate block h-full w-full min-h-[240px] sm:min-h-[280px] overflow-hidden rounded-[1.5rem] bg-sage-wash shadow-soft transition-all duration-500 hover:shadow-lift",
          isLead
            ? "aspect-4/3 sm:aspect-16/10 lg:aspect-auto lg:min-h-[460px]"
            : "aspect-4/5 sm:aspect-4/3 lg:aspect-auto lg:min-h-[240px]"
        )}
      >
        <button
          aria-label={`View photo of ${card.name || card.alt}`}
          className="relative block h-full w-full cursor-pointer overflow-hidden rounded-[1.5rem] text-left outline-offset-2 focus-visible:outline-2 focus-visible:outline-forest"
          onClick={() => open(index)}
          ref={(node) => {
            thumbs.current[index] = node;
          }}
          style={{ opacity: active === index ? 0 : 1 }}
          type="button"
        >
          {/* Background image with pointer-events-none and select-none so no blue selection or image dragging happens */}
          <Image
            alt=""
            className="pointer-events-none select-none h-full w-full object-cover transition-transform duration-[1.2s] ease-premium group-hover:scale-[1.05]"
            draggable={false}
            fill
            sizes={
              isLead
                ? "(min-width: 1024px) 560px, 100vw"
                : "(min-width: 1024px) 380px, 50vw"
            }
            src={card.src}
            style={card.position ? { objectPosition: card.position } : undefined}
            unoptimized
          />

          {/* Dark bottom gradient overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-forest-abyss/85 via-forest-abyss/20 to-transparent select-none"
          />

          {/* Badge: product count */}
          {card.count !== null && card.count !== undefined ? (
            <span className="pointer-events-none absolute top-3.5 left-3.5 select-none rounded-full bg-paper/92 px-2.5 py-1 text-[0.6875rem] font-semibold text-ink tabular-nums shadow-2xs backdrop-blur-sm sm:top-4 sm:left-4">
              {card.count} {card.count === 1 ? "product" : "products"}
            </span>
          ) : null}

          {/* Bottom title, tagline, and arrow indicator */}
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 flex select-none items-end justify-between gap-3",
              isLead ? "p-6 sm:p-8" : "p-4 sm:p-5"
            )}
          >
            <div className="min-w-0">
              <h3
                className={cn(
                  "font-bold text-white",
                  isLead
                    ? "dh-title-section text-2xl sm:text-3xl"
                    : "dh-title-card max-sm:text-[1rem]"
                )}
              >
                {card.name || card.alt}
              </h3>
              {card.tagline ? (
                <p
                  className={cn(
                    "mt-1 font-normal text-white/80",
                    isLead ? "text-[0.9375rem]" : "hidden text-[0.8125rem] sm:block"
                  )}
                >
                  {card.tagline}
                </p>
              ) : null}
            </div>

            <span
              aria-hidden="true"
              className={cn(
                "grid shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-[background-color,color,transform] duration-300 group-hover:bg-white group-hover:text-forest-deep",
                isLead ? "size-11" : "size-9"
              )}
            >
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      {isFeaturedCollection && leadCard ? (
        <div className="grid gap-4 sm:gap-5 lg:h-144 lg:grid-cols-12">
          {/* Lead card */}
          <div className="lg:col-span-5">{renderCard(leadCard, 0, true)}</div>

          {/* 4 secondary cards in 2x2 grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:col-span-7 lg:grid-rows-2">
            {restCards.map((card, idx) => (
              <div key={card.src + idx}>{renderCard(card, idx + 1, false)}</div>
            ))}
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {cardList.map((image, index) => (
            <li
              className={cn(index === 0 && "col-span-2 row-span-2")}
              key={image.src + index}
            >
              {renderCard(image, index, index === 0)}
            </li>
          ))}
        </ul>
      )}

      {/* Full-view Lightbox Modal Portal */}
      {active !== null && rect
        ? createPortal(
            <Viewer
              alpha={alpha}
              clip={clip}
              fade={fade}
              images={cardList}
              index={active}
              onClose={close}
              onStep={step}
              rect={rect}
              scale={scale}
              settled={settled && !closing}
              x={x}
              y={y}
            />,
            document.body
          )
        : null}
    </div>
  );
}

export { LightboxGrid };
