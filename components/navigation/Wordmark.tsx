import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The DocHomoeo lockup: a dual botanical leaf emblem beside the DocHomoeo brand title.
 * Matches the reference design with 'DocHomoeo' and 'HEAL NATURALLY'.
 */
export function Wordmark({
  className,
  tone = "light",
  showTagline = true,
}: {
  className?: string;
  tone?: "light" | "dark";
  showTagline?: boolean;
}) {
  const isDark = tone === "dark";

  return (
    <Link
      href="/"
      aria-label="DocHomoeo — Heal Naturally"
      className={cn("group flex items-center gap-2.5 select-none", className)}
    >
      <span
        aria-hidden
        className={cn(
          "relative grid size-10 shrink-0 place-items-center rounded-xl transition-all duration-300 group-hover:scale-105",
          isDark
            ? "bg-cream/10 text-cream"
            : "bg-[#0d5a43]/10 text-[#0d5a43] shadow-xs"
        )}
      >
        {/* Botanical double leaf emblem with stem berries */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-6 text-[#0d5a43]"
        >
          {/* Left leaf */}
          <path
            d="M15 17C12 16.5 8 13 8 7C14 7 16 11 15 17Z"
            fill="currentColor"
            fillOpacity="0.85"
          />
          {/* Right leaf */}
          <path
            d="M17 17C20 16.5 24 13 24 7C18 7 16 11 17 17Z"
            fill="currentColor"
          />
          {/* Stem & accent dots */}
          <circle cx="16" cy="19.5" r="1.5" fill="#c98e55" />
          <circle cx="13.5" cy="22" r="1.2" fill="#c98e55" />
          <circle cx="18.5" cy="22" r="1.2" fill="#c98e55" />
          <path
            d="M16 17V26"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-sans font-bold text-[1.25rem] tracking-tight sm:text-[1.35rem]",
            isDark ? "text-cream" : "text-[#14251f]"
          )}
        >
          Doc<span className="text-[#0d5a43]">Homoeo</span>
        </span>
        {showTagline ? (
          <span
            className={cn(
              "mt-1 text-[0.5625rem] font-semibold tracking-[0.16em] uppercase",
              isDark ? "text-cream/70" : "text-[#66716c]"
            )}
          >
            Heal Naturally
          </span>
        ) : null}
      </span>
    </Link>
  );
}
