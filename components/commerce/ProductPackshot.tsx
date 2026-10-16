import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { ProductForm } from "@/types/product";

/**
 * The illustrated pack: what a product shows when the shop has no photograph
 * of that exact product. Another product's photo is never borrowed: the pack
 * is drawn from the product's own name, brand, potency and dosage form.
 *
 * It draws a container for the dosage form and prints the product's own name,
 * brand and potency on its label, so every card is distinct and nothing is
 * misattributed. When the form is not known (`null`: the product's name and
 * pack do not state it, and listing data carries no form) it draws a plain
 * carton, so no bottle or tube is implied. Everything is sized in container units, so the same markup
 * reads as a packshot on the product page, a card in the grid and a 48px cart
 * thumbnail — where the label text steps aside and only its rules remain.
 */

type Palette = {
  /** Backdrop wash behind the stage. */
  surface: string;
  /** The arch the pack stands in front of. */
  arch: string;
  glass: string;
  cap: string;
  label: string;
  ink: string;
  accent: string;
};

const PALETTES: Record<ProductForm | "unknown", Palette> = {
  unknown: {
    surface: "linear-gradient(180deg, #f1f0ea 0%, #e6e6dc 100%)",
    arch: "linear-gradient(180deg, #dfe2d6 0%, #d4d9cb 100%)",
    glass: "#f7f4ec",
    cap: "#d9d3c4",
    label: "#fffdf8",
    ink: "#14251f",
    accent: "#0d5a43",
  },
  drops: {
    surface: "linear-gradient(180deg, #f6efe3 0%, #efe3cf 100%)",
    arch: "linear-gradient(180deg, #ead8bb 0%, #e4cfae 100%)",
    glass: "#8c5522",
    cap: "#231c15",
    label: "#fbf7ee",
    ink: "#14251f",
    accent: "#0d5a43",
  },
  tincture: {
    surface: "linear-gradient(180deg, #edf1e8 0%, #e1e9db 100%)",
    arch: "linear-gradient(180deg, #d5e0cf 0%, #c9d7c3 100%)",
    glass: "#6e3f17",
    cap: "#1d2b26",
    label: "#fbf7ee",
    ink: "#14251f",
    accent: "#063b2d",
  },
  tablets: {
    surface: "linear-gradient(180deg, #eef2ec 0%, #e3ebe1 100%)",
    arch: "linear-gradient(180deg, #d9e4d6 0%, #cddccb 100%)",
    glass: "#f3f0e8",
    cap: "#0d5a43",
    label: "#fffdf8",
    ink: "#14251f",
    accent: "#0d5a43",
  },
  cream: {
    surface: "linear-gradient(180deg, #f6eee8 0%, #efe2d8 100%)",
    arch: "linear-gradient(180deg, #ecd9cb 0%, #e5cebd 100%)",
    glass: "#fbf8f2",
    cap: "#0d5a43",
    label: "#fbf8f2",
    ink: "#14251f",
    accent: "#a2512f",
  },
  oil: {
    surface: "linear-gradient(180deg, #f7efdf 0%, #f0e2c6 100%)",
    arch: "linear-gradient(180deg, #ecd8b1 0%, #e5cc9d 100%)",
    glass: "#9a4a1f",
    cap: "#b9895a",
    label: "#fbf7ee",
    ink: "#14251f",
    accent: "#7a3a17",
  },
};

/** Cross-section lighting for a round vessel: dark edge, bright turn, falloff. */
const CURVATURE =
  "linear-gradient(90deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.06) 13%, rgba(255,255,255,0.32) 27%, rgba(255,255,255,0.06) 47%, rgba(0,0,0,0.08) 76%, rgba(0,0,0,0.24) 100%)";
const MATTE =
  "linear-gradient(90deg, rgba(20,37,31,0.16) 0%, rgba(255,255,255,0.0) 18%, rgba(255,255,255,0.55) 32%, rgba(255,255,255,0) 52%, rgba(20,37,31,0.06) 80%, rgba(20,37,31,0.18) 100%)";

const FORM_WORDS = /\s+(drops|dilution|cream|ointment|gel|oil|pellets|globules|tablets|tincture)$/i;
const POTENCY = /\s+(\d+\s?(?:C|CH|X|M|LM)|Q|\d{2,4})$/i;

const FORM_NOUN: Record<ProductForm, string> = {
  drops: "Drops",
  tincture: "Mother tincture",
  tablets: "Tablets",
  cream: "Cream",
  oil: "Oil",
};

/**
 * "Arnica Montana 30C" → { title: "Arnica Montana", detail: "30C" }
 * "Calendula Ointment" → { title: "Calendula", detail: "Ointment" }
 * Only splits what the name itself says; nothing is added.
 */
export function packLabel(name: string, form: ProductForm | null): { title: string; detail: string } {
  let title = name.trim();
  let potency: string | null = null;
  let formWord: string | null = null;

  const potencyMatch = title.match(POTENCY);
  if (potencyMatch) {
    potency = potencyMatch[1].replace(/\s+/g, " ").toUpperCase();
    title = title.slice(0, potencyMatch.index).trim();
  }
  const formMatch = title.match(FORM_WORDS);
  if (formMatch && title.length > formMatch[0].length) {
    formWord = formMatch[1].charAt(0).toUpperCase() + formMatch[1].slice(1).toLowerCase();
    title = title.slice(0, formMatch.index).trim();
  }
  return { title, detail: potency ?? formWord ?? (form ? FORM_NOUN[form] : "") };
}

type ProductPackshotProps = {
  name: string;
  /** Null when the dosage form is not known: a plain carton is drawn. */
  form: ProductForm | null;
  brand?: string | null;
  className?: string;
  /** Accessible name. Omit when the pack sits beside a visible product name. */
  label?: string;
};

export function ProductPackshot({ name, form, brand, className, label }: ProductPackshotProps) {
  const palette = PALETTES[form ?? "unknown"];
  const { title, detail } = packLabel(name, form);
  const vars = {
    "--pk-glass": palette.glass,
    "--pk-cap": palette.cap,
    "--pk-label": palette.label,
    "--pk-ink": palette.ink,
    "--pk-accent": palette.accent,
  } as CSSProperties;

  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-packshot={form ?? "unknown"}
      className={cn("absolute inset-0 overflow-hidden [container-type:size]", className)}
      style={{ ...vars, backgroundImage: palette.surface }}
    >
      {/* Key light from above-left; no blur filters, two gradients only. */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(70% 55% at 38% 12%, rgba(255,255,255,0.75), transparent 70%), radial-gradient(60% 40% at 50% 100%, rgba(20,37,31,0.07), transparent 70%)",
        }}
      />

      {/* The arch the pack stands in front of: a studio backdrop, not decoration. */}
      <span
        aria-hidden
        className="absolute bottom-[11%] left-1/2 h-[min(98cqmin,84cqh)] w-[80cqmin] [@container(orientation:landscape)]:w-[70cqmin] -translate-x-1/2 rounded-t-full"
        style={{ backgroundImage: palette.arch }}
      />
      {/* Floor line and contact shadow. */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-[11%] bg-white/35" />
      <span
        aria-hidden
        className="absolute bottom-[9.5%] left-1/2 h-[6cqmin] w-[62cqmin] -translate-x-1/2 rounded-[50%]"
        style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(20,37,31,0.28), transparent 72%)" }}
      />

      {/* Landscape frames (homepage rows) are short: the pack steps down so
          its cap never meets the top edge. */}
      <div
        aria-hidden
        className="absolute bottom-[11%] left-1/2 flex origin-bottom -translate-x-1/2 flex-col items-center [@container(orientation:landscape)]:scale-[0.84]"
      >
        <Vessel form={form}>
          <Label brand={brand} title={title} detail={detail} wide={form === "tablets" || form === null} />
        </Vessel>
      </div>
    </div>
  );
}

function Vessel({ form, children }: { form: ProductForm | null; children: React.ReactNode }) {
  if (form === null) {
    // A plain carton: the shape of no particular dosage form.
    return (
      <>
        <span
          className="relative z-10 h-[4cqmin] w-[54cqmin] rounded-t-[0.8cqmin]"
          style={{ background: `${MATTE}, var(--pk-cap)` }}
        />
        <span
          className="relative h-[60cqmin] w-[52cqmin] overflow-hidden rounded-b-[1.2cqmin]"
          style={{ background: `${MATTE}, var(--pk-glass)` }}
        >
          <span className="absolute inset-x-0 top-[6%] h-[2.5%] bg-(--pk-accent)/70" />
          {children}
        </span>
      </>
    );
  }

  if (form === "tablets") {
    return (
      <>
        <span
          className="relative z-10 h-[13cqmin] w-[58cqmin] rounded-t-[3cqmin] rounded-b-[1cqmin]"
          style={{ background: `${CURVATURE}, var(--pk-cap)` }}
        >
          <span className="absolute inset-x-0 bottom-[22%] h-[10%] bg-black/15" />
        </span>
        <span
          className="relative -mt-[0.5cqmin] h-[52cqmin] w-[56cqmin] overflow-hidden rounded-t-[2.6cqmin] rounded-b-[6cqmin]"
          style={{ background: `${MATTE}, var(--pk-glass)` }}
        >
          {children}
        </span>
      </>
    );
  }

  if (form === "cream") {
    return (
      <>
        {/* A tube standing on its flip cap: crimp at the top, cap below. */}
        <span
          className="relative z-10 h-[5cqmin] w-[48cqmin] rounded-t-[0.8cqmin]"
          style={{
            background:
              "repeating-linear-gradient(90deg, rgba(20,37,31,0.16) 0 0.9cqmin, transparent 0.9cqmin 2cqmin), #ece6da",
          }}
        />
        <span
          className="relative h-[64cqmin] w-[47cqmin] overflow-hidden"
          style={{
            background: `${MATTE}, var(--pk-glass)`,
            clipPath: "polygon(0 0, 100% 0, 88% 100%, 12% 100%)",
          }}
        >
          <span className="absolute inset-x-0 top-[6%] h-[3%] bg-(--pk-accent)/80" />
          {children}
        </span>
        <span
          className="relative h-[9cqmin] w-[25cqmin] rounded-b-[1.8cqmin] rounded-t-[0.5cqmin]"
          style={{ background: `${CURVATURE}, var(--pk-cap)` }}
        />
      </>
    );
  }

  if (form === "oil") {
    return (
      <>
        <span
          className="relative z-10 h-[12cqmin] w-[17cqmin] rounded-t-[2cqmin] rounded-b-[0.8cqmin]"
          style={{ background: `${CURVATURE}, var(--pk-cap)` }}
        />
        <span className="relative h-[8cqmin] w-[13cqmin]" style={{ background: `${CURVATURE}, var(--pk-glass)` }} />
        <span
          className="relative h-[60cqmin] w-[45cqmin] overflow-hidden rounded-t-[14cqmin] rounded-b-[4cqmin]"
          style={{ background: `${CURVATURE}, var(--pk-glass)` }}
        >
          <Highlight />
          {children}
        </span>
      </>
    );
  }

  // Drops and mother tinctures: amber dropper bottles; the tincture stands taller.
  const tall = form === "tincture";
  return (
    <>
      <span className="relative z-10 h-[10cqmin] w-[11cqmin] rounded-t-full" style={{ background: "var(--pk-cap)" }} />
      <span
        className="relative z-10 h-[12cqmin] w-[20cqmin] rounded-[1cqmin]"
        style={{
          background: `${CURVATURE}, repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 0.8cqmin, transparent 0.8cqmin 1.8cqmin), var(--pk-cap)`,
        }}
      />
      <span className="relative z-10 h-[2.6cqmin] w-[22cqmin] rounded-[0.5cqmin] brightness-125" style={{ background: "var(--pk-cap)" }} />
      <span
        className={cn(
          "relative overflow-hidden rounded-t-[12cqmin] rounded-b-[4.5cqmin]",
          tall ? "h-[58cqmin] w-[46cqmin]" : "h-[55cqmin] w-[52cqmin]",
        )}
        style={{ background: `${CURVATURE}, var(--pk-glass)` }}
      >
        <Highlight />
        {children}
      </span>
    </>
  );
}

function Highlight() {
  return <span className="absolute top-[7%] bottom-[10%] left-[17%] z-1 w-[6%] rounded-full bg-white/30" />;
}

function Label({
  brand,
  title,
  detail,
  wide,
}: {
  brand?: string | null;
  title: string;
  detail: string;
  wide: boolean;
}) {
  return (
    <span
      className={cn(
        "absolute inset-x-[7%] z-2 flex flex-col items-center justify-center gap-[1.5cqmin] rounded-[1cqmin] px-[2.6cqmin] text-center shadow-[0_1px_2px_rgba(0,0,0,0.12)]",
        wide ? "top-[18%] bottom-[14%]" : "top-[24%] bottom-[9%]",
      )}
      style={{ background: "var(--pk-label)", color: "var(--pk-ink)" }}
    >
      {/* Below ~9rem the frame is a thumbnail: keep the label's rhythm as
          rules and drop the type, which would only be noise at that size. */}
      <span className="hidden h-[0.7cqmin] w-[45%] rounded-full bg-(--pk-accent)/75 @max-[9rem]:block" />
      <span className="hidden h-[0.6cqmin] w-[62%] rounded-full bg-black/15 @max-[9rem]:block" />
      <span className="hidden h-[0.6cqmin] w-[38%] rounded-full bg-black/10 @max-[9rem]:block" />

      {brand ? (
        <span className="max-w-full truncate text-[3cqmin] leading-none font-semibold tracking-[0.12em] uppercase opacity-60 @max-[9rem]:hidden">
          {brand}
        </span>
      ) : null}
      <span className="block h-px w-[30%] bg-(--pk-accent)/50 @max-[9rem]:hidden" />
      <span className="line-clamp-3 text-[5.2cqmin] leading-[1.08] font-semibold tracking-[-0.01em] [overflow-wrap:anywhere] hyphens-auto @max-[9rem]:hidden">
        {title}
      </span>
      {detail ? (
        <span className="text-[3.5cqmin] leading-none font-semibold tracking-[0.08em] uppercase @max-[9rem]:hidden" style={{ color: "var(--pk-accent)" }}>
          {detail}
        </span>
      ) : null}
    </span>
  );
}
