"use client";

import Image from "next/image";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, FlaskConical, Leaf, ShieldCheck } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { gsap } from "@/lib/animation/gsap";
import {
  DURATION,
  EASE,
  STAGGER,
  prefersReducedMotion,
  releaseRevealGate,
} from "@/lib/animation/motion";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * Art direction note — NaturesCareBG.png is 1672 x 941 and the four glass
 * arches sit at fixed pixel positions inside it:
 *
 *   drops      x 556-755   apex y 338
 *   tablets    x 779-1025  apex y 252
 *   tinctures  x 1046-1260 apex y 332
 *   creams     x 1294-1510 apex y 374
 *
 * Every number below is derived from that frame, which is why the stage is
 * aspect-locked and acts as a container: positions are percentages of the
 * frame and type is sized in `cqw`, so the labels stay welded to their arch at
 * any viewport width instead of drifting off the glass.
 *
 * The labels are typography laid directly on the arch — no card, no panel.
 * The arch is the container; it is already in the artwork.
 *
 * Type is Plus Jakarta Sans throughout, matching the hero and every other
 * section — one family across the homepage.
 */

type Collection = {
  id: string;
  name: string;
  /** Authored line breaks — the arch is narrow, so wrapping is not left to chance. */
  tagline: [string, string];
  productCount: string;
  href: string;
  /** Top-left of the label block, as a fraction of the 1672 x 941 frame. */
  pos: { left: string; top: string };
};

const collections: Collection[] = [
  {
    id: "drops",
    name: "Drops",
    tagline: ["Natural healing", "in every drop"],
    productCount: "120+ Products",
    href: "/products?form=drops",
    pos: { left: "35.29%", top: "38.47%" },
  },
  {
    id: "tablets",
    name: "Tablets",
    tagline: ["Easy care for", "daily wellness"],
    productCount: "200+ Products",
    href: "/products?form=tablets",
    pos: { left: "49.10%", top: "29.97%" },
  },
  {
    id: "tinctures",
    name: "Tinctures",
    tagline: ["Pure extracts", "for deeper support"],
    productCount: "90+ Products",
    href: "/products?form=tincture",
    pos: { left: "64.71%", top: "38.26%" },
  },
  {
    id: "creams",
    name: "Creams",
    tagline: ["Gentle care for", "skin and more"],
    productCount: "80+ Products",
    href: "/products?form=cream",
    pos: { left: "79.60%", top: "42.30%" },
  },
];

const trustBadges = [
  { id: "natural", icon: Leaf, lead: "100%", trail: "Natural" },
  { id: "tested", icon: FlaskConical, lead: "Lab", trail: "Tested" },
  { id: "trusted", icon: ShieldCheck, lead: "Trusted", trail: "Worldwide" },
] as const;

const HEADLINE_LINES = ["Nature’s Care", "In Every Form"];

export function FeaturedCollection() {
  const stageRef = useRef<HTMLDivElement>(null);

  /**
   * One timeline for the whole stage so the frame has finished settling before
   * the arch labels fade up — otherwise the labels would be visible while the
   * arches underneath them were still moving.
   */
  useIsomorphicLayoutEffect(() => {
    const root = stageRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      releaseRevealGate(root);
      return;
    }

    const ctx = gsap.context(() => {
      const scene = root.querySelector("[data-stage-scene]");
      const lines = root.querySelectorAll("[data-line-inner]");
      const intro = root.querySelectorAll("[data-intro-item]");
      const labels = root.querySelectorAll("[data-arch-reveal]");

      // fromTo throughout: the from-state belongs to the tween, so the markup
      // renders visible on the server and stays visible if GSAP never runs.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 78%",
          once: true,
          invalidateOnRefresh: true,
        },
      });

      if (scene) {
        tl.fromTo(
          scene,
          { scale: 1.055, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.15, ease: EASE.premium },
          0,
        );
      }

      if (lines.length) {
        tl.fromTo(
          lines,
          { yPercent: 108, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: DURATION.slow,
            ease: EASE.premium,
            stagger: STAGGER.line,
          },
          0.18,
        );
      }

      if (intro.length) {
        tl.fromTo(
          intro,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: DURATION.medium,
            ease: EASE.soft,
            stagger: STAGGER.tight,
          },
          0.42,
        );
      }

      if (labels.length) {
        tl.fromTo(
          labels,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: DURATION.slow,
            ease: EASE.premium,
            stagger: STAGGER.card,
          },
          0.8,
        );
      }

      releaseRevealGate(root);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="featured-collection"
      aria-labelledby="collection-heading"
      className="relative z-10 w-full overflow-hidden bg-[#f6f2ea]"
    >
      {/* Subtle atmospheric boundary transitions */}
      <div aria-hidden className="dh-section-blend-top" />
      <div aria-hidden className="dh-section-blend-bottom" />

      {/* ================================================================= */}
      {/* 1. DESKTOP: 1:1 overlay on the 1672x941 apothecary frame          */}
      {/* ================================================================= */}
      <div
        ref={stageRef}
        data-motion-gate
        className="relative mx-auto hidden aspect-[1672/941] w-full max-w-[1720px] select-none overflow-hidden [container-type:inline-size] lg:block"
      >
        <div data-stage-scene data-reveal className="absolute inset-0 will-change-transform">
          <Image
            src="/Images/NaturesCareBG.webp"
            alt="Apothecary medicines on stone podiums beside a reflecting pool"
            fill
            sizes="100vw"
            className="pointer-events-none select-none object-cover object-center"
          />
        </div>

        {/* --------------------------------------------------------------- */}
        {/* LEFT COLUMN — on the sunlit stucco wall, clear of the first arch */}
        {/* --------------------------------------------------------------- */}
        <div className="absolute top-[47%] left-[3.8%] z-20 flex w-[32%] -translate-y-1/2 flex-col items-start">
          <span
            data-intro-item
            data-reveal
            className="block text-[0.75cqw] font-semibold tracking-[0.26em] text-[#63756a] uppercase"
          >
            Featured Collection
          </span>

          <h2
            id="collection-heading"
            className="mt-[2cqw] font-sans text-[3.8cqw] leading-[1.04] font-bold tracking-tight text-[#13352a]"
          >
            {HEADLINE_LINES.map((line) => (
              <span key={line} className="dh-reveal-line">
                <span
                  data-line-inner
                  data-reveal-line
                  className="block will-change-transform"
                >
                  {line}
                </span>
              </span>
            ))}
          </h2>

          <p
            data-intro-item
            data-reveal
            className="mt-[1.7cqw] max-w-[23cqw] text-[1.14cqw] leading-[1.55] font-medium text-[#44584c]"
          >
            Explore our most trusted formulations, grouped by how you prefer to take them.
          </p>

          <Link
            data-intro-item
            data-reveal
            href="/products"
            className="group/cta mt-[2.4cqw] inline-flex items-center gap-[0.75cqw] rounded-full bg-[#0c503b] px-[1.9cqw] py-[1.05cqw] text-[0.99cqw] font-bold text-white shadow-[0_8px_24px_-12px_rgba(9,45,32,0.75)] transition-[background-color,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[#073c2b] hover:shadow-[0_14px_32px_-12px_rgba(9,45,32,0.8)] active:translate-y-0"
          >
            <span>Shop All Products</span>
            <ArrowRight className="size-[0.95cqw] stroke-[2] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:translate-x-[0.3cqw]" />
          </Link>

          <ul
            data-intro-item
            data-reveal
            className="mt-[2.9cqw] flex list-none items-center gap-[1.25cqw]"
          >
            {trustBadges.map((badge, index) => (
              <li key={badge.id} className="flex items-center gap-[1.25cqw]">
                {index > 0 && (
                  <span aria-hidden className="h-[2.4cqw] w-px bg-[#17412f]/20" />
                )}
                <span className="flex items-center gap-[0.6cqw]">
                  <badge.icon
                    aria-hidden
                    className="size-[1.65cqw] shrink-0 stroke-[1.4] text-[#1b4432]"
                  />
                  <span className="text-[1.08cqw] leading-[1.24] whitespace-nowrap">
                    <span className="block font-bold text-[#17382b]">{badge.lead}</span>
                    <span className="block font-medium text-[#3d5347]">{badge.trail}</span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* ARCH LABELS — set directly on the glass, no card behind them     */}
        {/* --------------------------------------------------------------- */}
        {collections.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            style={{ left: item.pos.left, top: item.pos.top }}
            className="group absolute z-20 flex flex-col items-start text-left outline-none focus-visible:outline-none"
          >
            {/* GSAP owns the transform on this wrapper … */}
            <span data-arch-reveal data-reveal className="block will-change-transform">
              {/* … and the hover lift lives on its own element, so the two
                  never fight over the same inline transform. */}
              <span className="block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[0.35cqw] group-focus-visible:-translate-y-[0.35cqw]">
                <span
                  className="block text-[1.58cqw] leading-[1.1] font-bold tracking-tight text-[#13352a] transition-colors duration-500 group-hover:text-[#0c503b]"
                >
                  {item.name}
                </span>

                <span className="mt-[0.55cqw] block text-[0.99cqw] leading-[1.42] font-medium text-[#3d5347]">
                  {item.tagline[0]}
                  <br />
                  {item.tagline[1]}
                </span>

                <span className="mt-[0.6cqw] block text-[0.69cqw] leading-[1.2] font-bold tracking-[0.17em] text-[#67796d] uppercase">
                  {item.productCount}
                </span>

                <span className="mt-[0.78cqw] flex size-[1.86cqw] items-center justify-center rounded-full border border-[#13352a]/30 bg-white/25 text-[#1f4a39] backdrop-blur-[2px] transition-[background-color,border-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-[#0c503b] group-hover:bg-[#0c503b] group-hover:text-white">
                  <ArrowRight className="size-[0.92cqw] stroke-[1.6] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[0.12cqw]" />
                </span>
              </span>
            </span>

            <span className="sr-only">{`Shop ${item.name}`}</span>
          </Link>
        ))}
      </div>

      {/* ================================================================= */}
      {/* 2. MOBILE / TABLET: the frame becomes a backdrop, type leads      */}
      {/* ================================================================= */}
      <div className="relative px-4 py-12 sm:px-6 sm:py-16 lg:hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none opacity-30"
        >
          <Image
            src="/Images/NaturesCareBG.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[center_35%]"
          />
        </div>

        <Container width="wide">
          <div className="flex flex-col gap-8">
            <div className="max-w-xl">
              <span className="block text-[0.72rem] font-semibold tracking-[0.24em] text-[#63756a] uppercase">
                Featured Collection
              </span>
              <h2
                className="mt-3 font-sans text-[2.3rem] leading-[1.06] font-bold tracking-tight text-[#13352a] sm:text-5xl"
              >
                Nature&rsquo;s Care
                <br />
                In Every Form
              </h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed font-medium text-[#44584c]">
                Explore our most trusted formulations, grouped by how you prefer to take them.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0c503b] px-7 py-3 text-sm font-bold text-white shadow-md transition-transform active:scale-95"
              >
                <span>Shop All Products</span>
                <ArrowRight className="size-4 stroke-[2]" />
              </Link>

              <ul className="mt-8 flex list-none items-center gap-4 border-t border-black/[0.08] pt-5 sm:gap-6">
                {trustBadges.map((badge) => (
                  <li key={badge.id} className="flex items-center gap-2">
                    <badge.icon
                      aria-hidden
                      className="size-[1.1rem] shrink-0 stroke-[1.5] text-[#1b4432]"
                    />
                    <span className="text-[0.78rem] leading-[1.25]">
                      <span className="block font-bold text-[#17382b]">{badge.lead}</span>
                      <span className="block font-medium text-[#3d5347]">{badge.trail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Arch-shaped glass panels — the mobile echo of the stage, not cards. */}
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
              {collections.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex flex-col justify-between rounded-t-[7rem] rounded-b-[1.5rem] border border-white/70 bg-white/55 p-5 pt-8 backdrop-blur-md transition-[background-color,transform] duration-300 active:scale-[0.98]"
                >
                  <div>
                    <h3
                      className="text-[1.15rem] leading-[1.15] font-bold tracking-tight text-[#13352a] transition-colors group-hover:text-[#0c503b]"
                    >
                      {item.name}
                    </h3>
                    <p className="mt-2 text-[0.78rem] leading-[1.42] font-medium text-[#3d5347]">
                      {item.tagline[0]} {item.tagline[1]}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="text-[0.6rem] font-bold tracking-[0.15em] text-[#67796d] uppercase">
                      {item.productCount}
                    </span>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#13352a]/25 text-[#1f4a39] transition-colors group-hover:border-[#0c503b] group-hover:bg-[#0c503b] group-hover:text-white">
                      <ArrowRight className="size-3.5 stroke-[1.7]" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
