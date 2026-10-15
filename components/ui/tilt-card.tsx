"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Tilt, type TiltProps } from "@/components/unlumen-ui/primitives/tilt";

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  /** Small origin / laboratory / category tag displayed above the title */
  origin?: string;
  /** Left half of the split badge pill (e.g. "7 remedies"); shown as a simple pill if `badgeLabel` is omitted */
  price?: string;
  /** Right half of the split pill, coloured by `badgeVariant` */
  badgeLabel?: string;
  badgeVariant?: "success" | "warning" | "brand";
  imageSrc?: string;
  imageAlt?: string;
  /** Brand seal or icon node rendered next to the title */
  icon?: React.ReactNode;
  /** Hex or RGB color string used for the animated circular ambient glow */
  accentColor?: string;
  /** CTA text in the bottom left, e.g. "Explore catalogue" */
  ctaLabel?: string;
  /** Wraps the card in a Next.js Link */
  href?: string;
  children?: React.ReactNode;
  tiltProps?: Omit<TiltProps, "children" | "className">;
}

const BADGE_LABEL_CLASSES: Record<
  NonNullable<TiltCardProps["badgeVariant"]>,
  string
> = {
  success: "bg-emerald-500/15 text-emerald-800 border-emerald-500/25",
  warning: "bg-amber-500/15 text-amber-800 border-amber-500/25",
  brand: "bg-forest/15 text-forest-deep border-forest/25",
};

export function TiltCard({
  title,
  description,
  origin,
  price,
  badgeLabel,
  badgeVariant = "brand",
  imageSrc,
  imageAlt = "",
  icon,
  accentColor = "#0d5a43",
  ctaLabel = "Explore catalogue",
  href,
  children,
  tiltProps,
  className,
  ...props
}: TiltCardProps) {
  const cardBody = (
    <Tilt
      rotationFactor={7}
      perspective={850}
      scaleOnHover={1.02}
      springDuration="0.45s cubic-bezier(0.22, 1, 0.36, 1)"
      {...tiltProps}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden",
        "rounded-2xl border border-line-soft bg-paper shadow-soft",
        "h-52 sm:h-56 w-full p-5 sm:p-6",
        "transition-[border-color,box-shadow] duration-400 ease-premium",
        "hover:border-forest/35 hover:shadow-lift",
        className,
      )}
    >
      {/* ── Top row: Identity & Split Badge ── */}
      <div className="relative z-20 flex items-start justify-between gap-3">
        {/* Left: Icon + Title + Origin/Description */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {icon ? <div className="shrink-0 pt-0.5">{icon}</div> : null}
          <div className="min-w-0 flex-1">
            {origin ? (
              <span className="block text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-ink">
                {origin}
              </span>
            ) : null}
            <h3 className="truncate font-display text-lg sm:text-xl font-bold tracking-tight text-ink transition-colors duration-300 group-hover:text-forest">
              {title}
            </h3>
            {description ? (
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-ink">
                {description}
              </p>
            ) : null}
            {children ? <div className="mt-2">{children}</div> : null}
          </div>
        </div>

        {/* Right: Split Pill Badge */}
        {price && badgeLabel ? (
          <div className="inline-flex h-fit items-center text-xs whitespace-nowrap shrink-0 shadow-2xs">
            <span className="rounded-l-full border border-r-0 border-line-soft bg-mist/80 px-2.5 py-1 font-semibold tabular-nums text-ink">
              {price}
            </span>
            <span
              className={cn(
                "rounded-r-full border px-2.5 py-1 font-semibold",
                BADGE_LABEL_CLASSES[badgeVariant],
              )}
            >
              {badgeLabel}
            </span>
          </div>
        ) : price ? (
          <span className="h-fit rounded-full border border-line-soft bg-mist/80 px-3 py-1 text-xs font-semibold tabular-nums text-ink shadow-2xs shrink-0">
            {price}
          </span>
        ) : null}
      </div>

      {/* ── Bottom row: CTA Action ── */}
      <div className="relative z-20 mt-auto flex items-center justify-between pt-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest transition-colors duration-300 group-hover:text-forest-deep">
          {ctaLabel}
          <ArrowRight
            aria-hidden
            className="size-3.5 transition-transform duration-300 ease-premium group-hover:translate-x-1"
          />
        </span>
      </div>

      {/* ── Bottom Right: Tilted Floating Product Packshot ── */}
      {imageSrc ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute z-10 -bottom-5 -right-5 w-36 sm:w-40 aspect-square",
            "rotate-[-6deg] transition-all duration-500 ease-premium",
            "group-hover:-rotate-2 group-hover:-translate-y-2 group-hover:-translate-x-1.5 group-hover:scale-105",
          )}
        >
          <div className="relative size-full overflow-hidden rounded-xl border border-line-soft/80 bg-paper/95 p-2.5 shadow-md backdrop-blur-xs">
            <Image
              src={imageSrc}
              alt={imageAlt || `${title} remedy packshot`}
              fill
              sizes="(max-width: 640px) 140px, 160px"
              className="object-contain transition-transform duration-500 ease-premium group-hover:scale-105"
            />
          </div>
        </div>
      ) : null}

      {/* ── Animated Circular Colored Glow & Concentric Rings ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      >
        {/* Breathing soft radial gradient glow */}
        <motion.div
          className="absolute rounded-full blur-2xl"
          style={{
            width: 280,
            height: 280,
            right: -70,
            bottom: -70,
            background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.14, 0.26, 0.14],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Slow rotating continuous precision ring */}
        <motion.div
          className="absolute rounded-full border border-current opacity-[0.08]"
          style={{
            width: 240,
            height: 240,
            right: -50,
            bottom: -50,
            color: accentColor,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Counter-rotating dashed apothecary ring */}
        <motion.div
          className="absolute rounded-full border border-dashed border-current opacity-[0.06]"
          style={{
            width: 170,
            height: 170,
            right: -15,
            bottom: -15,
            color: accentColor,
          }}
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </Tilt>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full cursor-pointer"
        {...(props as any)}
      >
        {cardBody}
      </Link>
    );
  }

  return <div {...props}>{cardBody}</div>;
}