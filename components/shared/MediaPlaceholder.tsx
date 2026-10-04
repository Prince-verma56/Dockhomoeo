import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MediaTone = "cream" | "sage" | "forest" | "amber" | "clay";

type MediaPlaceholderProps = {
  /**
   * What will eventually occupy this frame. Written as a real description so
   * the art direction brief travels with the markup and becomes the `alt`
   * text when a `next/image` or canvas replaces the placeholder.
   */
  label: string;
  className?: string;
  tone?: MediaTone;
  /** Tailwind aspect ratio utility, e.g. "aspect-[4/5]". */
  ratio?: string;
  rounded?: string;
  /** Rendered above the lighting layers — a product glyph, a badge, a chip. */
  children?: ReactNode;
  /** Soft vignette at the base, so a subject reads as standing on a surface. */
  grounded?: boolean;
  grain?: boolean;
};

/**
 * The single media-ready frame used everywhere a photograph, render or canvas
 * will later be dropped in (brain/24_3D_MEDIA_SPEC.md).
 *
 * It is built only from layered gradients — a key light, a cool bounce, a warm
 * rim and an inner hairline — so it reads as a lit studio surface rather than a
 * grey box, while costing nothing to download. To replace one, swap the
 * `children` for `<Image fill alt={label} />` or a `<Canvas>`; the frame,
 * ratio, radius and lighting stay.
 */
const TONES: Record<MediaTone, { surface: string; key: string; bounce: string }> = {
  cream: {
    surface: "bg-[#f4efe4]",
    key: "radial-gradient(70% 58% at 50% 18%, rgba(255,255,255,0.95), transparent 70%)",
    bounce:
      "radial-gradient(60% 45% at 18% 92%, rgba(184,201,182,0.42), transparent 72%)",
  },
  sage: {
    surface: "bg-[#e4ebdf]",
    key: "radial-gradient(72% 60% at 54% 14%, rgba(255,255,255,0.9), transparent 72%)",
    bounce:
      "radial-gradient(64% 50% at 14% 96%, rgba(13,90,67,0.2), transparent 74%)",
  },
  forest: {
    surface: "bg-[#0a4635]",
    key: "radial-gradient(68% 56% at 50% 12%, rgba(199,226,205,0.34), transparent 70%)",
    bounce:
      "radial-gradient(62% 48% at 84% 96%, rgba(201,142,85,0.26), transparent 72%)",
  },
  amber: {
    surface: "bg-[#f1e4d2]",
    key: "radial-gradient(70% 58% at 46% 16%, rgba(255,252,246,0.96), transparent 70%)",
    bounce:
      "radial-gradient(58% 46% at 86% 94%, rgba(201,142,85,0.38), transparent 72%)",
  },
  clay: {
    surface: "bg-[#ece6da]",
    key: "radial-gradient(74% 60% at 50% 10%, rgba(255,255,255,0.92), transparent 72%)",
    bounce:
      "radial-gradient(60% 48% at 20% 94%, rgba(102,113,108,0.26), transparent 74%)",
  },
};

export function MediaPlaceholder({
  label,
  className,
  tone = "cream",
  ratio = "aspect-[4/3]",
  rounded = "rounded-frame",
  children,
  grounded = true,
  grain = true,
}: MediaPlaceholderProps) {
  const palette = TONES[tone];

  return (
    <div
      role="img"
      aria-label={label}
      data-media-slot
      className={cn(
        "relative isolate overflow-hidden",
        palette.surface,
        ratio,
        rounded,
        grain && "dh-grain",
        tone === "forest" && grain && "dh-grain-dark",
        className,
      )}
    >
      {/* Key light + bounce. Two gradients only; no blur filters. */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: `${palette.key}, ${palette.bounce}` }}
      />

      {/* Contact shadow: lets a subject sit on the surface instead of float. */}
      {grounded ? (
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/3"
          style={{
            backgroundImage:
              tone === "forest"
                ? "linear-gradient(to top, rgba(4,42,32,0.55), transparent)"
                : "linear-gradient(to top, rgba(20,37,31,0.09), transparent)",
          }}
        />
      ) : null}

      {/* Inner hairline, so frames read as glass-edged rather than cut out. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-[2] rounded-[inherit] ring-1 ring-inset",
          tone === "forest" ? "ring-white/12" : "ring-ink/8",
        )}
      />

      {children ? (
        <div className="absolute inset-0 z-[2]">{children}</div>
      ) : null}
    </div>
  );
}
