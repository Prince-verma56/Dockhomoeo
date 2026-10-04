import type { SVGProps } from "react";

/**
 * Social marks drawn to match lucide's geometry — 24px box, 1.6 stroke, round
 * caps — because lucide v1 no longer ships brand icons and mixing a filled
 * brand-icon set into a stroked family looks exactly as wrong as it sounds
 * (brain/06_COMPONENT_SYSTEM.md: one coherent icon family).
 */
const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function FacebookMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15L15.5 10h-3V6.8c0-.5.3-.8.8-.8H15.5V3Z" />
    </svg>
  );
}

export function InstagramMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.4 9.6 15 12l-4.6 2.4V9.6Z" />
    </svg>
  );
}

export function XMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 4.5 19.5 19.5" />
      <path d="M19.5 4.5 4.5 19.5" />
    </svg>
  );
}
