import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ProductStageProps = {
  /** What the finished scene will show. Becomes the accessible name. */
  label: string;
  /**
   * The subject layer. Today a `<ProductGlyph>`; later an `<Image fill />`, a
   * `<video>` or an R3F `<Canvas>`. Everything around it — lighting, glass
   * arcs, pedestal, contact shadow — belongs to the stage and does not change.
   */
  children: ReactNode;
  className?: string;
  /** Dark stage for the offer banner; light stage for the hero. */
  tone?: "light" | "dark";
  ratio?: string;
};

/**
 * The hero product stage (brain/24_3D_MEDIA_SPEC.md).
 *
 * A pedestal, two glass arcs, a key light and a contact shadow, all assembled
 * from CSS so the hero is heavy-looking but weightless to download. The subject
 * is a single slot, which is the whole point: dropping in a 3D scene later is a
 * child swap, not a hero rewrite.
 */
export function ProductStage({
  label,
  children,
  className,
  tone = "light",
  ratio = "aspect-[5/6]",
}: ProductStageProps) {
  const isDark = tone === "dark";

  return (
    <div
      role="img"
      aria-label={label}
      data-media-slot
      className={cn("relative isolate w-full", ratio, className)}
    >
      {/* Key light. Large, soft, single source from above — the scene's only
          real light, so the composition stays calm. */}
      <span
        aria-hidden
        className="absolute inset-[-14%]"
        style={{
          backgroundImage: isDark
            ? "radial-gradient(44% 38% at 50% 26%, rgba(214,232,219,0.26), transparent 72%)"
            : "radial-gradient(46% 40% at 50% 24%, rgba(255,255,255,0.95), transparent 70%)",
        }}
      />

      {/* Outer glass arc. A translucent ring, not a frosted panel — no
          backdrop blur, so this costs nothing to composite. */}
      <span
        aria-hidden
        className={cn(
          "absolute top-[4%] left-1/2 aspect-square w-[88%] -translate-x-1/2 rounded-full border",
          isDark ? "border-white/14" : "border-white/70",
        )}
        style={{
          backgroundImage: isDark
            ? "linear-gradient(170deg, rgba(255,255,255,0.08), transparent 52%)"
            : "linear-gradient(170deg, rgba(255,255,255,0.72), transparent 54%)",
        }}
      />

      {/* Inner arc, offset and thinner, to give the scene depth layers. */}
      <span
        aria-hidden
        className={cn(
          "absolute top-[17%] left-1/2 aspect-square w-[62%] -translate-x-1/2 rounded-full border",
          isDark ? "border-white/10" : "border-forest/12",
        )}
      />

      {/* Botanical accent: two thin crescents, deliberately restrained — the
          spec rules out a flower explosion. */}
      <span
        aria-hidden
        className={cn(
          "absolute top-[30%] left-[4%] h-[34%] w-[16%] rounded-[100%_0_100%_0] border-l",
          isDark ? "border-sage/25" : "border-forest/18",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute top-[38%] right-[5%] h-[28%] w-[13%] rounded-[0_100%_0_100%] border-r",
          isDark ? "border-sage/20" : "border-forest/14",
        )}
      />

      {/* Pedestal: a stone ellipse with a lit top edge and a shadowed base. */}
      <span
        aria-hidden
        className="absolute bottom-[8%] left-1/2 h-[9%] w-[56%] -translate-x-1/2 rounded-[50%]"
        style={{
          backgroundImage: isDark
            ? "linear-gradient(to bottom, #15402f, #0a2a1f)"
            : "linear-gradient(to bottom, #efe9db, #ddd5c4)",
          boxShadow: isDark
            ? "inset 0 1px 0 rgba(255,255,255,0.12)"
            : "inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      />
      <span
        aria-hidden
        className="absolute bottom-[5.5%] left-1/2 h-[6%] w-[52%] -translate-x-1/2 rounded-[50%]"
        style={{
          backgroundImage: isDark
            ? "linear-gradient(to bottom, #0b2d21, #061e16)"
            : "linear-gradient(to bottom, #ddd5c4, #cfc5b1)",
        }}
      />

      {/* Contact shadow pooling outward from the pedestal base. */}
      <span
        aria-hidden
        className="absolute bottom-[1%] left-1/2 h-[9%] w-[74%] -translate-x-1/2 rounded-[50%]"
        style={{
          backgroundImage: isDark
            ? "radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.5), transparent 70%)"
            : "radial-gradient(50% 50% at 50% 50%, rgba(20,37,31,0.18), transparent 70%)",
        }}
      />

      {/* --- subject slot --- */}
      <div className="absolute inset-0 bottom-[8%]">{children}</div>
    </div>
  );
}
