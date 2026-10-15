import Image from "next/image";
import { cn } from "@/lib/utils";
import { Parallax } from "@/components/shared/Parallax";

type DepthImageProps = {
  src: string;
  /** Empty when the image is decorative beside text that already names it. */
  alt?: string;
  sizes: string;
  /** Preload in the document head: the page's LCP image only. */
  preload?: boolean;
  /** Frame classes: size, aspect ratio, radius. The frame clips the image. */
  className?: string;
  imageClassName?: string;
  /** CSS object-position, for photographs whose subject sits off centre. */
  position?: string;
  /** Parallax travel (see Parallax). Small values only; 0 disables it. */
  speed?: number;
};

/**
 * A photograph that fills its frame and drifts slightly against the scroll
 * inside it. The image is overscanned 8% top and bottom so the drift never
 * uncovers an edge; the frame itself does not move, so the layout is static.
 * Parallax is desktop-only and off under reduced motion.
 */
export function DepthImage({
  src,
  alt = "",
  sizes,
  preload = false,
  className,
  imageClassName,
  position,
  speed = -8,
}: DepthImageProps) {
  const image = (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      style={position ? { objectPosition: position } : undefined}
      className={cn("object-cover", imageClassName)}
    />
  );

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {speed === 0 ? (
        image
      ) : (
        <Parallax speed={speed} className="absolute inset-x-0 -inset-y-[8%]">
          {image}
        </Parallax>
      )}
    </div>
  );
}
