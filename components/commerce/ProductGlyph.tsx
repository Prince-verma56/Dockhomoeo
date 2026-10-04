import { cn } from "@/lib/utils";
import type { ProductForm } from "@/types/product";

export type GlassTone = "amber" | "forest" | "clear" | "cobalt";

type ProductGlyphProps = {
  form: ProductForm;
  tone?: GlassTone;
  className?: string;
  /** Scales the silhouette inside its frame. */
  size?: "sm" | "md" | "lg";
};

/**
 * A product silhouette assembled from layered CSS — cap, collar, glass body,
 * curvature gradient, specular highlight and label.
 *
 * This is the stand-in subject inside a `MediaPlaceholder` until photography or
 * a 3D render exists. It is deliberately recognisable as a medicine container
 * (brain/24_3D_MEDIA_SPEC.md: "the product should have a clear silhouette")
 * without pretending to be any real brand's packaging.
 */

const GLASS: Record<GlassTone, { base: string; cap: string; ring: string }> = {
  amber: { base: "#9c6321", cap: "#2b2318", ring: "rgba(232,201,163,0.55)" },
  forest: { base: "#0d5a43", cap: "#10241c", ring: "rgba(184,201,182,0.5)" },
  clear: { base: "#9fb0ac", cap: "#1d2b26", ring: "rgba(255,255,255,0.6)" },
  cobalt: { base: "#2c4a63", cap: "#15212b", ring: "rgba(197,217,232,0.5)" },
};

/** Cross-section lighting: dark edge, bright turn, falloff, dark edge. */
const CURVATURE =
  "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.08) 12%, rgba(255,255,255,0.34) 27%, rgba(255,255,255,0.07) 48%, rgba(0,0,0,0.1) 76%, rgba(0,0,0,0.26) 100%)";

const SIZES = {
  sm: "h-[64%]",
  md: "h-[74%]",
  lg: "h-[84%]",
} as const;

function Label({ wide = false }: { wide?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute inset-x-[8%] bottom-[14%] flex flex-col items-center justify-center gap-[6%] rounded-[3px] bg-[#f7f3e9]/92 py-[9%] shadow-[0_1px_2px_rgba(0,0,0,0.14)]",
        wide ? "top-[26%]" : "top-[30%]",
      )}
    >
      <span className="h-[5%] min-h-[2px] w-[46%] rounded-full bg-forest/75" />
      <span className="h-[4%] min-h-[1.5px] w-[62%] rounded-full bg-ink/18" />
      <span className="h-[4%] min-h-[1.5px] w-[38%] rounded-full bg-ink/12" />
    </span>
  );
}

function Highlight() {
  return (
    <span
      aria-hidden
      className="absolute top-[8%] bottom-[12%] left-[20%] w-[7%] rounded-full bg-white/38"
    />
  );
}

export function ProductGlyph({
  form,
  tone = "amber",
  className,
  size = "md",
}: ProductGlyphProps) {
  const glass = GLASS[tone];

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 flex items-end justify-center pb-[9%]",
        className,
      )}
    >
      <div
        className={cn("relative flex w-full flex-col items-center", SIZES[size])}
      >
        {/* Halo and contact shadow are drawn first so they stay behind the
            object. Both are plain gradients — no blur filter per glyph. */}
        <span
          className="absolute inset-x-[16%] top-[6%] bottom-[2%] rounded-[50%]"
          style={{
            background: `radial-gradient(50% 50% at 50% 50%, ${glass.ring}, transparent 70%)`,
            opacity: 0.4,
          }}
        />
        <span
          className="absolute -bottom-[4%] left-1/2 h-[7%] w-[62%] -translate-x-1/2 rounded-[50%]"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(20,37,31,0.32), transparent 72%)",
          }}
        />

        {form === "drops" || form === "tincture" ? (
          <>
            {/* Pipette bulb + cap */}
            <span
              className="relative z-10 h-[7%] w-[11%] rounded-t-full"
              style={{ background: glass.cap }}
            />
            <span
              className="relative z-10 h-[11%] w-[17%] rounded-[3px]"
              style={{
                background: `${CURVATURE}, ${glass.cap}`,
              }}
            />
            <span
              className="relative z-10 h-[3%] w-[21%] rounded-[2px]"
              style={{ background: glass.cap, filter: "brightness(1.25)" }}
            />
            {/* Shoulder + body */}
            <span
              className="relative w-[29%] flex-1 overflow-hidden rounded-t-[26%] rounded-b-[10%]"
              style={{ background: `${CURVATURE}, ${glass.base}` }}
            >
              <Highlight />
              <Label />
            </span>
          </>
        ) : null}

        {form === "tablets" ? (
          <>
            {/* Screw lid */}
            <span
              className="relative z-10 h-[13%] w-[44%] rounded-t-[8px] rounded-b-[3px]"
              style={{ background: `${CURVATURE}, ${glass.cap}` }}
            />
            <span
              className="relative z-10 -mt-[1%] h-[3%] w-[48%] rounded-[2px]"
              style={{ background: glass.cap, filter: "brightness(1.3)" }}
            />
            {/* Jar */}
            <span
              className="relative w-[46%] flex-1 overflow-hidden rounded-t-[8%] rounded-b-[16%]"
              style={{ background: `${CURVATURE}, ${glass.base}` }}
            >
              <Highlight />
              <Label wide />
            </span>
          </>
        ) : null}

        {form === "cream" ? (
          <>
            {/* Flip cap sits at the base of a tube, so the tube is inverted */}
            <span
              className="relative z-10 h-[6%] w-[9%] rounded-t-[3px]"
              style={{ background: glass.cap }}
            />
            {/* Crimped shoulder tapering into the body */}
            <span
              className="relative w-[38%] flex-1 overflow-hidden rounded-t-[42%_18%] rounded-b-[5px]"
              style={{ background: `${CURVATURE}, ${glass.base}` }}
            >
              <Highlight />
              <Label />
              <span className="absolute inset-x-0 bottom-0 h-[5%] bg-ink/25" />
            </span>
          </>
        ) : null}

        {form === "oil" ? (
          <>
            <span
              className="relative z-10 h-[9%] w-[19%] rounded-[3px]"
              style={{ background: `${CURVATURE}, ${glass.cap}` }}
            />
            <span
              className="relative z-10 h-[4%] w-[13%]"
              style={{ background: glass.cap, filter: "brightness(1.2)" }}
            />
            <span
              className="relative w-[34%] flex-1 overflow-hidden rounded-t-[34%] rounded-b-[12%]"
              style={{ background: `${CURVATURE}, ${glass.base}` }}
            >
              <Highlight />
              <Label />
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
