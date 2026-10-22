"use client";

import { ReactNode, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Layers,
  Scale,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { cn } from "@/lib/utils";
import { gsap, ScrollTrigger } from "@/lib/animation/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

export type LegalSection = {
  id: string;
  label: string;
  title?: string;
  content: ReactNode;
};

export type LegalPageLayoutProps = {
  /** Page title, e.g. "Refund Policy" */
  title: string;
  /** Short intro lede shown in the hero */
  intro?: string;
  /** Optional last updated date */
  lastUpdated?: string;
  /** Structured sections of the document */
  sections: LegalSection[];
  /** Optional callout box displayed at the bottom of the content */
  callout?: ReactNode;
  /** Optional backward-compatible children */
  children?: ReactNode;
};

const POLICY_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/return-cancellation", label: "Return & Cancellation" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/refund-policy", label: "Refund Policy" },
];

/**
 * Shared layout for all legal & policy pages.
 *
 * Single Natural Browser Scroll Architecture:
 * - One continuous page scrollbar for the entire window — no nested scrollable pane.
 * - Left sidebar pinned via sticky container for the exact duration of the document sections.
 * - Releases cleanly before the footer, preventing overlapping.
 * - GSAP ScrollTrigger actively tracks whichever section is in the reading area and highlights it.
 * - Clicking any left sidebar item smoothly scrolls the main viewport to that section with header offset.
 */
export function LegalPageLayout({
  title,
  intro,
  lastUpdated,
  sections,
  callout,
  children,
}: LegalPageLayoutProps) {
  const pathname = usePathname();
  const [activeId, setActiveId] = useState<string>(
    sections.length > 0 ? sections[0].id : ""
  );
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isClickScrollingRef = useRef(false);

  // Smoothly scroll the window to the target section, accounting for fixed SiteHeader offset
  const scrollToSection = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    setActiveId(id);
    isClickScrollingRef.current = true;
    window.history.replaceState(null, "", `#${id}`);

    const headerOffset = 130;
    const targetRect = target.getBoundingClientRect();
    const targetTop = targetRect.top + window.scrollY - headerOffset;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });

    setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 700);
  }, []);

  // GSAP ScrollTrigger: Scroll-spy tracking of the active section in the reading area
  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined" || sections.length === 0) return;

    const ctx = gsap.context(() => {
      sections.forEach((sec) => {
        const el = document.getElementById(sec.id);
        if (!el) return;

        ScrollTrigger.create({
          trigger: el,
          start: "top 35%",
          end: "bottom 35%",
          onEnter: () => {
            if (!isClickScrollingRef.current) {
              setActiveId(sec.id);
              window.history.replaceState(null, "", `#${sec.id}`);
            }
          },
          onEnterBack: () => {
            if (!isClickScrollingRef.current) {
              setActiveId(sec.id);
              window.history.replaceState(null, "", `#${sec.id}`);
            }
          },
        });
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, [sections]);

  // Deep-link hash handling on mount (e.g. #liability or #ordering)
  useEffect(() => {
    if (typeof window === "undefined" || sections.length === 0) return;
    const hash = window.location.hash.replace("#", "");
    if (hash && sections.some((s) => s.id === hash)) {
      setActiveId(hash);
      const timer = setTimeout(() => {
        scrollToSection(hash);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [sections, scrollToSection]);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-canvas">
        {/* ============================================================== */}
        {/* Hero Band with generous clearance for fixed SiteHeader         */}
        {/* ============================================================== */}
        <section className="dh-band-sage relative overflow-hidden pt-36 sm:pt-40 md:pt-44 pb-10 md:pb-14 border-b border-line-soft/60">
          <Container width="wide" className="relative z-10 max-w-6xl">
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest-deep/70 transition-colors hover:text-forest-deep"
            >
              <ArrowLeft className="size-3.5" />
              Return to Home
            </Link>

            <div className="flex items-start gap-4">
              <div className="mt-1 hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-forest-deep/10 text-forest-deep sm:flex shadow-2xs">
                <Scale className="size-6" />
              </div>
              <div className="max-w-3xl">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-sage-wash/80 border border-forest-deep/15 px-3 py-0.5 text-xs font-semibold text-forest-deep">
                  <ShieldCheck className="size-3.5" />
                  Official Compliance Document
                </div>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink">
                  {title}
                </h1>
                {intro && (
                  <p className="mt-2.5 text-base sm:text-lg leading-relaxed text-muted-ink">
                    {intro}
                  </p>
                )}
                {lastUpdated && (
                  <p className="mt-2 text-xs font-medium text-muted-ink/80">
                    Last updated: {lastUpdated}
                  </p>
                )}
              </div>
            </div>
          </Container>

          {/* Ambient gradient */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-b from-sage-wash/60 via-canvas/40 to-canvas pointer-events-none"
          />
        </section>

        {/* ============================================================== */}
        {/* Mobile / Tablet Horizontal Section Chips (Sticky below header) */}
        {/* ============================================================== */}
        {sections.length > 0 && (
          <div className="sticky top-16 z-30 bg-paper/95 backdrop-blur-md border-b border-line-soft lg:hidden">
            <div className="flex items-center gap-2 overflow-x-auto px-4 py-2.5 scrollbar-none">
              {sections.map((sec, idx) => {
                const isActive = activeId === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToSection(sec.id)}
                    className={cn(
                      "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer border",
                      isActive
                        ? "bg-forest-deep text-white border-forest-deep shadow-xs font-bold"
                        : "bg-canvas text-muted-ink border-line-soft hover:text-ink"
                    )}
                  >
                    {idx + 1}. {sec.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* Main Layout: Fixed Left Sidebar + Natural Page Flow Content    */}
        {/* ============================================================== */}
        <section className="py-8 md:py-12">
          <Container width="wide" className="max-w-6xl">
            <div ref={wrapperRef} className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-10 xl:gap-12 items-start relative">
              
              {/* ============================================================ */}
              {/* DESKTOP PINNED LEFT SIDEBAR (Sticky within wrapper, releases cleanly) */}
              {/* ============================================================ */}
              <aside className="hidden lg:block w-[280px] shrink-0">
                <div className="sticky top-32 lg:top-36 space-y-5">
                  
                  {/* Table of Contents / Document Sections */}
                  {sections.length > 0 && (
                    <div className="rounded-2xl border border-line-soft bg-paper p-4.5 shadow-xs">
                      <div className="flex items-center justify-between mb-3 px-1 text-xs font-bold uppercase tracking-wider text-muted-ink">
                        <div className="flex items-center gap-2">
                          <Layers className="size-3.5 text-forest-deep" />
                          <span>Document Sections</span>
                        </div>
                        <span className="text-[10.5px] font-mono text-muted-ink/70">
                          {sections.length} total
                        </span>
                      </div>

                      <nav aria-label="Table of contents" className="space-y-1">
                        {sections.map((sec, idx) => {
                          const isActive = activeId === sec.id;
                          return (
                            <button
                              key={sec.id}
                              type="button"
                              onClick={() => scrollToSection(sec.id)}
                              className={cn(
                                "group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-all cursor-pointer",
                                isActive
                                  ? "bg-forest-deep text-white shadow-xs font-bold"
                                  : "text-muted-ink hover:bg-sage-wash/50 hover:text-forest-deep"
                              )}
                            >
                              <span className="flex items-center gap-2 truncate pr-2">
                                <span
                                  className={cn(
                                    "font-mono text-[11px] shrink-0",
                                    isActive ? "text-cream/90 font-bold" : "text-muted-ink/70 group-hover:text-forest-deep/80"
                                  )}
                                >
                                  {String(idx + 1).padStart(2, "0")}
                                </span>
                                <span className="truncate">{sec.label}</span>
                              </span>
                              {isActive ? (
                                <span className="size-1.5 rounded-full bg-cream shrink-0" />
                              ) : null}
                            </button>
                          );
                        })}
                      </nav>
                    </div>
                  )}

                  {/* All Legal Policy Documents */}
                  <div className="rounded-2xl border border-line-soft bg-paper p-4.5 shadow-xs">
                    <div className="flex items-center gap-2 mb-3 px-1 text-xs font-bold uppercase tracking-wider text-muted-ink">
                      <FileText className="size-3.5 text-forest-deep" />
                      <span>Legal Documents</span>
                    </div>

                    <ul className="space-y-1">
                      {POLICY_LINKS.map((link) => {
                        const isCurrent = pathname === link.href;
                        return (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className={cn(
                                "flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all",
                                isCurrent
                                  ? "bg-sage-wash text-forest-deep font-bold border border-forest-deep/20"
                                  : "text-muted-ink hover:text-forest-deep hover:bg-canvas"
                              )}
                            >
                              <span>{link.label}</span>
                              {isCurrent && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-forest-deep uppercase tracking-wider">
                                  <CheckCircle2 className="size-3 text-forest-deep" />
                                  Active
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                </div>
              </aside>

              {/* ============================================================ */}
              {/* RIGHT CONTENT: Natural Page Flow (One Single Scrollbar)      */}
              {/* ============================================================ */}
              <div className="min-w-0 flex-1 space-y-6 sm:space-y-8">
                {sections.length > 0 ? (
                  sections.map((sec, idx) => {
                    const isActive = activeId === sec.id;
                    return (
                      <article
                        key={sec.id}
                        id={sec.id}
                        className={cn(
                          "scroll-mt-32 rounded-3xl border p-6 sm:p-9 md:p-10 transition-all duration-300 shadow-soft",
                          isActive
                            ? "border-forest-deep/35 bg-paper ring-1 ring-forest-deep/15"
                            : "border-line-soft/80 bg-paper/70 hover:border-line-soft"
                        )}
                      >
                        {/* Section Header Meta */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft/80 pb-3.5 mb-5">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-wash/80 border border-forest-deep/15 px-3 py-0.5 text-xs font-bold text-forest-deep">
                              <span className="font-mono">{String(idx + 1).padStart(2, "0")}</span>
                              <span className="size-1 rounded-full bg-forest-deep/40" />
                              <span>Section {idx + 1} of {sections.length}</span>
                            </span>
                            {isActive && (
                              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-forest-deep animate-in fade-in">
                                <span className="size-1.5 rounded-full bg-forest-deep animate-pulse" />
                                Active Section
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] font-mono text-muted-ink/70 tracking-wide">
                            #{sec.id}
                          </span>
                        </div>

                        {/* Section Heading */}
                        <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-ink mb-4 leading-snug">
                          {sec.title || sec.label}
                        </h2>

                        {/* Rich Section Content */}
                        <div className="legal-content prose prose-neutral max-w-none text-ink/90 text-sm sm:text-base leading-relaxed">
                          {sec.content}
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="legal-content prose prose-neutral max-w-none rounded-3xl border border-line-soft bg-paper p-6 sm:p-9 md:p-10 shadow-soft">
                    {children}
                  </div>
                )}

                {/* Callout box (Support email, Archival notes, Legal inquiries) */}
                {callout && (
                  <div className="rounded-3xl border border-line-soft bg-canvas/70 p-6 sm:p-8 text-xs sm:text-sm text-ink leading-relaxed shadow-xs">
                    {callout}
                  </div>
                )}
              </div>

            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
