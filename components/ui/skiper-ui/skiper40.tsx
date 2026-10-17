"use client";

import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

/**
 * Skiper 40 Animated Link — Enhanced for DocHomoeo
 * Inspired by and adapted from https://cursor.com/?from=home
 */

export interface SkiperLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  href: string;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Brand palette variant for hover accent line & arrow */
  tone?: "forest" | "current" | "cream" | "ink" | "sage";
}

const TONE_STYLES = {
  forest: "text-forest hover:text-forest-deep before:bg-forest",
  current: "text-current before:bg-current",
  cream: "text-cream/80 hover:text-cream before:bg-cream",
  ink: "text-ink hover:text-forest before:bg-forest",
  sage: "text-forest-deep hover:text-forest before:bg-forest",
} as const;

/**
 * Helper to render either Next.js Link or standard Anchor
 */
function BaseLink({
  href,
  children,
  className,
  target,
  rel,
  onClick,
  ...props
}: SkiperLinkProps) {
  const isExternal =
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    target === "_blank";

  if (isExternal) {
    return (
      <a
        href={href}
        target={target ?? "_blank"}
        rel={rel ?? "noopener noreferrer"}
        onClick={onClick}
        className={className}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * Link000: Underline drawing from right to left, smooth scaling on hover
 */
export const Link000 = ({
  children,
  href,
  className,
  tone = "current",
  ...props
}: SkiperLinkProps) => {
  return (
    <BaseLink
      href={href}
      className={cn(
        "group relative inline-flex items-center transition-colors duration-200",
        TONE_STYLES[tone],
        "before:pointer-events-none before:absolute before:bottom-0 before:left-0 before:h-[0.06em] before:w-full before:content-['']",
        "before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:before:origin-left hover:before:scale-x-100",
        className
      )}
      {...props}
    >
      {children}
    </BaseLink>
  );
};

/**
 * Link001: Underline reveal + sliding diagonal arrow on hover (Signature cursor style)
 */
export const Link001 = ({
  children,
  href,
  className,
  tone = "forest",
  ...props
}: SkiperLinkProps) => {
  return (
    <BaseLink
      href={href}
      className={cn(
        "group relative inline-flex items-center transition-colors duration-200",
        TONE_STYLES[tone],
        "before:pointer-events-none before:absolute before:bottom-0 before:left-0 before:h-[0.06em] before:w-full before:content-['']",
        "before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:before:origin-left hover:before:scale-x-100",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <svg
        className="ml-1.5 size-[0.62em] translate-y-1 opacity-0 transition-all duration-300 [motion-reduce:transition-none] group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none shrink-0"
        fill="none"
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </BaseLink>
  );
};

/**
 * Link002: Underline drawing from left to right + sliding diagonal arrow
 */
export const Link002 = ({
  children,
  href,
  className,
  tone = "current",
  ...props
}: SkiperLinkProps) => {
  return (
    <BaseLink
      href={href}
      className={cn(
        "group relative inline-flex items-center transition-colors duration-200",
        TONE_STYLES[tone],
        "before:pointer-events-none before:absolute before:bottom-0 before:left-0 before:h-[0.06em] before:w-full before:content-['']",
        "before:origin-left before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:before:origin-right hover:before:scale-x-100",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <svg
        className="ml-1.5 size-[0.62em] translate-y-1 opacity-0 transition-all duration-300 [motion-reduce:transition-none] group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none shrink-0"
        fill="none"
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </BaseLink>
  );
};

/**
 * Link003: Underline expanding from center outwards + sliding diagonal arrow
 */
export const Link003 = ({
  children,
  href,
  className,
  tone = "current",
  ...props
}: SkiperLinkProps) => {
  return (
    <BaseLink
      href={href}
      className={cn(
        "group relative inline-flex items-center transition-colors duration-200",
        TONE_STYLES[tone],
        "before:pointer-events-none before:absolute before:bottom-0 before:left-0 before:h-[0.06em] before:w-full before:content-['']",
        "before:origin-center before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:before:scale-x-100",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <svg
        className="ml-1.5 size-[0.62em] translate-y-1 opacity-0 transition-all duration-300 [motion-reduce:transition-none] group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none shrink-0"
        fill="none"
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </BaseLink>
  );
};

/**
 * Link004: Block fill hover animation
 */
export const Link004 = ({
  children,
  href,
  className,
  tone = "forest",
  ...props
}: SkiperLinkProps) => {
  return (
    <BaseLink
      href={href}
      className={cn(
        "group relative inline-flex items-center px-2 py-0.5 transition-colors duration-200",
        "before:pointer-events-none before:absolute before:left-0 before:w-full before:content-['']",
        tone === "forest" ? "text-forest before:bg-forest/10" : "before:bg-current/10",
        "before:origin-center md:before:bottom-0",
        "before:z-[-1] before:h-0 before:scale-x-100 before:rounded-md hover:before:h-full before:transition-all before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <svg
        className="ml-1.5 size-[0.62em] translate-y-1 opacity-0 transition-all duration-300 [motion-reduce:transition-none] group-hover:translate-y-0 group-hover:rotate-45 group-hover:opacity-100 motion-reduce:transition-none shrink-0"
        fill="none"
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </BaseLink>
  );
};

/**
 * Link005: Horizontal slide-in block fill hover
 */
export const Link005 = ({
  children,
  href,
  className,
  tone = "forest",
  ...props
}: SkiperLinkProps) => {
  return (
    <BaseLink
      href={href}
      className={cn(
        "group relative inline-flex items-center px-2 py-0.5 transition-colors duration-200",
        "before:pointer-events-none before:absolute before:left-0 before:w-full before:content-['']",
        tone === "forest" ? "text-forest before:bg-forest/10" : "before:bg-current/10",
        "before:origin-left md:before:top-0",
        "before:z-[-1] before:h-full before:scale-x-0 before:rounded-md hover:before:scale-x-100 before:transition-all before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <svg
        className="ml-1.5 size-[0.62em] -translate-x-1 rotate-45 opacity-0 transition-all duration-300 [motion-reduce:transition-none] group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none shrink-0"
        fill="none"
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </BaseLink>
  );
};

export const Skiper40 = () => {
  return (
    <section className="h-full snap-y snap-mandatory overflow-y-scroll">
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-5">
        <Link001 href="mailto:hi@skiper-ui.com">hi@skiper-ui.com</Link001>
        <Link002 href="mailto:hi@skiper-ui.com">hi@skiper-ui.com</Link002>
        <Link003 href="mailto:hi@skiper-ui.com">hi@skiper-ui.com</Link003>
        <Link004 href="mailto:hi@skiper-ui.com">hi@skiper-ui.com</Link004>
        <Link005 href="mailto:hi@skiper-ui.com">hi@skiper-ui.com</Link005>
      </div>
    </section>
  );
};

export default Skiper40;
