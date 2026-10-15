import Image from "next/image";
import { cn } from "@/lib/utils";

/** "Dr. Reckeweg" → "DR", "DOC HOMEO" → "DH", "SBL" → "SBL", "Schwabe" → "S". */
export function brandMonogram(name: string): string {
  const words = name.replace(/[^A-Za-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) {
    const [word] = words;
    return word.length <= 4 && word === word.toUpperCase() ? word : word[0].toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Five restrained tones from the palette. A brand always gets the same one
 * (picked from its name), so a mark is recognisable from page to page.
 */
const TONES = [
  "bg-forest-deep text-cream [--ring:rgb(255_253_248/0.22)]",
  "bg-sage-tint text-forest-deep [--ring:rgb(13_90_67/0.18)]",
  "bg-[#f1e4d3] text-[#74461f] [--ring:rgb(116_70_31/0.18)]",
  "bg-[#f3ddd3] text-[#8a3b24] [--ring:rgb(138_59_36/0.18)]",
  "bg-cream-sunk text-ink [--ring:rgb(20_37_31/0.14)]",
] as const;

const toneFor = (name: string) => {
  let hash = 5381;
  for (const char of name) hash = ((hash * 33) ^ char.charCodeAt(0)) >>> 0;
  return TONES[hash % TONES.length];
};

const SIZES = {
  sm: { box: "size-11 rounded-[0.8rem]", inset: "inset-[3px] rounded-[0.6rem]", type: ["text-base", "text-[0.8125rem]", "text-[0.6875rem]"] },
  md: { box: "size-16 rounded-[1.1rem]", inset: "inset-1 rounded-[0.85rem]", type: ["text-[1.625rem]", "text-lg", "text-[0.9375rem]"] },
  lg: { box: "size-20 rounded-[1.35rem] sm:size-24 sm:rounded-[1.6rem]", inset: "inset-1 rounded-[1.1rem] sm:inset-[5px] sm:rounded-[1.3rem]", type: ["text-[2.25rem] sm:text-[2.75rem]", "text-2xl sm:text-[1.75rem]", "text-lg sm:text-[1.375rem]"] },
} as const;

/**
 * A brand's logo or, until a licensed logo is supplied, a typographic seal:
 * the monogram set in the display face inside a hairline-inset tile. It is
 * deliberately a mark of our own making, not an imitation of the brand's,
 * and is hidden from assistive tech because the name always sits beside it.
 */
export function BrandMark({
  name,
  logoUrl,
  size = "md",
  className,
}: {
  name: string;
  logoUrl: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const spec = SIZES[size];

  if (logoUrl) {
    return (
      <span className={cn("relative block shrink-0 overflow-hidden border border-line/80 bg-white", spec.box, className)}>
        <Image src={logoUrl} alt={`${name} logo`} fill sizes="96px" className="object-contain p-2" />
      </span>
    );
  }

  const monogram = brandMonogram(name);
  // One letter carries more weight than three; scale the type to the mark.
  const type = spec.type[Math.min(monogram.length, 3) - 1] ?? spec.type[2];

  return (
    <span
      aria-hidden
      className={cn("relative grid shrink-0 place-items-center overflow-hidden", spec.box, toneFor(name), className)}
    >
      <span className={cn("pointer-events-none absolute border border-(--ring)", spec.inset)} />
      <span className={cn("relative font-display leading-none tracking-[0.04em]", type)}>{monogram}</span>
    </span>
  );
}

/**
 * Panel palettes for the wordmark: the brand's surface and its ink. Pale and
 * close to the page palette, so a grid of brands reads as one family.
 */
const PANELS = [
  { panel: "bg-sage-wash", ink: "text-forest-deep", rule: "bg-forest/30" },
  { panel: "bg-[#f3ebe0]", ink: "text-[#5e3b1c]", rule: "bg-[#5e3b1c]/30" },
  { panel: "bg-[#f4e6df]", ink: "text-[#7a3520]", rule: "bg-[#7a3520]/30" },
  { panel: "bg-mist", ink: "text-ink", rule: "bg-ink/25" },
  { panel: "bg-forest-deep", ink: "text-cream", rule: "bg-cream/35" },
] as const;

const panelFor = (name: string) => {
  let hash = 5381;
  for (const char of name) hash = ((hash * 33) ^ char.charCodeAt(0)) >>> 0;
  return PANELS[hash % PANELS.length];
};

/**
 * A brand's identity panel: its licensed logo when the data supplies one,
 * otherwise its full name set as a wordmark in the display face — a
 * typographic treatment of our own, never an imitation of the brand's logo
 * and never a product photo standing in for one. Decorative: the name is
 * always repeated as text beside it.
 */
export function BrandWordmark({
  name,
  logoUrl,
  size = "md",
  className,
}: {
  name: string;
  logoUrl: string | null;
  size?: "md" | "lg";
  className?: string;
}) {
  if (logoUrl) {
    return (
      <span aria-hidden className={cn("relative block overflow-hidden bg-white", className)}>
        <Image src={logoUrl} alt="" fill sizes="320px" className="object-contain p-6" />
      </span>
    );
  }

  const tone = panelFor(name);
  const compact = name.replace(/[^A-Za-z0-9]/g, "");
  // Short all-caps names (SBL) are letter-spaced like a seal; longer names set tight.
  const acronym = compact.length <= 4 && compact === compact.toUpperCase();
  const type =
    size === "lg"
      ? acronym
        ? "text-[2.5rem] tracking-[0.18em]"
        : name.length > 11
          ? "text-[1.75rem] tracking-[-0.01em]"
          : "text-[2.125rem] tracking-[-0.015em]"
      : acronym
        ? "text-[1.75rem] tracking-[0.16em]"
        : name.length > 11
          ? "text-[1.25rem] tracking-[-0.01em]"
          : "text-[1.5rem] tracking-[-0.015em]";

  return (
    <span
      aria-hidden
      className={cn("relative flex flex-col items-center justify-center gap-2.5 overflow-hidden px-5 text-center", tone.panel, className)}
    >
      <span
        className={cn(
          "relative leading-none font-display transition-transform duration-500 ease-premium group-hover:scale-[1.03]",
          tone.ink,
          type,
        )}
      >
        {name}
      </span>
      <span className={cn("relative h-px w-8", tone.rule)} />
    </span>
  );
}
