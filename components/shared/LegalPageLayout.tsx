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
  Mail,
  Clock,
  Globe,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { cn } from "@/lib/utils";
import { getLenis } from "@/components/providers/SmoothScrollProvider";

export type LegalSection = {
  id: string;
  label: string;
  title?: string;
  content: ReactNode;
};

export type LegalPageLayoutProps = {
  /** Page title, e.g. "Terms & Conditions" */
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
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/return-cancellation", label: "Return & Cancellation" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/refund-policy", label: "Refund Policy" },
];

/**
 * Shared layout for all legal & policy pages.
 *
 * Minimalist Luxury Architecture:
 * - One natural browser scrollbar for the entire page — no nested double scrollbars.
 * - Left sidebar is firmly PINNED in position (`sticky top-28 self-start`) for the exact
 *   height of the document content, releasing cleanly before the footer.
 * - Real-time deterministic Scroll-Spy dynamically tracks which section is in the reading
 *   area and updates the active tab in the left sidebar with zero lag.
 * - Clicking any left sidebar tab smoothly scrolls to that exact section with header offset.
 * - Premium editorial aesthetics: refined borders, subtle elevation, beautiful typography,
 *   clean micro-badges, and hidden scrollbars.
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
  const initialId = sections.length > 0 ? sections[0].id : "";
  const [activeId, setActiveId] = useState<string>(initialId);
  const activeIdRef = useRef<string>(initialId);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sidebarNavRef = useRef<HTMLDivElement>(null);
  const isClickScrollingRef = useRef(false);

  // Smoothly scroll the window to the target section, with clearance for fixed SiteHeader
  const scrollToSection = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    activeIdRef.current = id;
    setActiveId(id);
    isClickScrollingRef.current = true;

    if (window.location.hash !== `#${id}`) {
      window.history.replaceState(null, "", `#${id}`);
    }

    const headerOffset = 130;
    const targetRect = target.getBoundingClientRect();
    const targetTop = targetRect.top + window.scrollY - headerOffset;

    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(targetTop, { duration: 0.85 });
    } else {
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "smooth",
      });
    }

    // Keep activeId locked to clicked target until scroll animation settles
    setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 900);
  }, []);

  // Real-time deterministic Scroll-Spy: updates active tab as user scrolls through sections
  useEffect(() => {
    if (typeof window === "undefined" || sections.length === 0) return;

    let ticking = false;

    const updateActiveSection = () => {
      if (isClickScrollingRef.current) return;

      // Reading threshold: calibrated to top 30-35% of viewport for natural reading awareness
      const readingLine = Math.min(260, window.innerHeight * 0.35);
      let currentSectionId = sections[0].id;

      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        const el = document.getElementById(sec.id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        // If the top of the section has reached or scrolled past the reading line:
        if (rect.top <= readingLine) {
          currentSectionId = sec.id;
        }
      }

      // Check if user has scrolled near the bottom of the page
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (windowHeight + scrollY >= documentHeight - 120) {
        currentSectionId = sections[sections.length - 1].id;
      }

      if (currentSectionId !== activeIdRef.current) {
        activeIdRef.current = currentSectionId;
        setActiveId(currentSectionId);

        // Safe history update outside React render cycle
        if (window.location.hash !== `#${currentSectionId}`) {
          window.history.replaceState(null, "", `#${currentSectionId}`);
        }
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateActiveSection);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    const lenis = getLenis();
    if (lenis) {
      lenis.on("scroll", handleScroll);
    }

    // Gentle check on mount after DOM layout settles
    const initialTimer = setTimeout(() => {
      updateActiveSection();
    }, 100);

    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener("scroll", handleScroll);
      if (lenis) {
        lenis.off("scroll", handleScroll);
      }
    };
  }, [sections]);

  // Deep-link hash handling on initial page load (e.g. #services or #ordering)
  useEffect(() => {
    if (typeof window === "undefined" || sections.length === 0) return;
    const hash = window.location.hash.replace("#", "");
    if (hash && sections.some((s) => s.id === hash)) {
      setActiveId(hash);
      const timer = setTimeout(() => {
        scrollToSection(hash);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [sections, scrollToSection]);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[#faf8f5] dark:bg-[#081510]">
        {/* ============================================================== */}
        {/* HERO SECTION: Minimalist, authoritative compliance banner     */}
        {/* ============================================================== */}
        <section className="relative overflow-hidden pt-36 sm:pt-40 md:pt-44 pb-12 md:pb-16 border-b border-black/[0.06] dark:border-white/10 bg-gradient-to-b from-[#f0f7f3] via-[#f7faf8] to-[#faf8f5] dark:from-[#091a13] dark:via-[#0c1f17] dark:to-[#081510]">
          <Container width="wide" className="relative z-10 max-w-6xl">
            {/* Breadcrumb Navigation */}
            <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-[#0d5a43] dark:hover:text-emerald-400"
              >
                <ArrowLeft className="size-3.5" />
                Home
              </Link>
              <span>/</span>
              <span>Legal &amp; Compliance</span>
              <span>/</span>
              <span className="text-[#0d5a43] dark:text-emerald-400 font-bold">
                {title}
              </span>
            </div>

            <div className="flex items-start gap-4 sm:gap-6">
              <div className="mt-1 hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-[#0d5a43]/10 text-[#0d5a43] dark:bg-emerald-500/15 dark:text-emerald-400 sm:flex border border-[#0d5a43]/15 shadow-2xs">
                <Scale className="size-7" />
              </div>

              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-500/20 px-3 py-0.5 text-xs font-bold text-[#0d5a43] dark:text-emerald-300 shadow-2xs">
                  <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Official Compliance Document</span>
                </div>

                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.12]">
                  {title}
                </h1>

                {intro && (
                  <p className="text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-300 max-w-2xl">
                    {intro}
                  </p>
                )}

                {/* Meta details row */}
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {lastUpdated && (
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="size-3.5 text-[#0d5a43] dark:text-emerald-400" />
                      <span>Last updated: {lastUpdated}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 font-medium">
                    <Globe className="size-3.5 text-[#0d5a43] dark:text-emerald-400" />
                    <span>Jurisdiction: Republic of India</span>
                  </span>
                </div>
              </div>
            </div>
          </Container>

          {/* Ambient subtle glow */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none"
          />
        </section>

        {/* ============================================================== */}
        {/* MOBILE STICKY CHIPS: Smooth horizontal scroller for smaller screens */}
        {/* ============================================================== */}
        {sections.length > 0 && (
          <div className="sticky top-16 sm:top-20 z-30 bg-white/95 dark:bg-[#0c1e17]/95 backdrop-blur-md border-b border-black/[0.06] dark:border-white/10 lg:hidden">
            <div className="flex items-center gap-2 overflow-x-auto px-4 py-2.5 dh-no-scrollbar scrollbar-none">
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
                        ? "bg-[#0d5a43] text-white border-[#0d5a43] shadow-xs font-bold"
                        : "bg-white dark:bg-white/5 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:text-neutral-900"
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
        {/* MAIN BODY: PINNED SIDEBAR (LEFT) + CONTINUOUS FLOW (RIGHT)     */}
        {/* ============================================================== */}
        <section className="py-10 md:py-14">
          <Container width="wide" className="max-w-6xl">
            <div
              ref={wrapperRef}
              className="grid gap-8 lg:grid-cols-[290px_1fr] xl:grid-cols-[310px_1fr] lg:gap-10 xl:gap-12 relative"
            >
              {/* ============================================================ */}
              {/* DESKTOP PINNED LEFT SIDEBAR (firmly sticky, natural release) */}
              {/* ============================================================ */}
              <aside className="hidden lg:block w-[290px] xl:w-[310px] shrink-0 sticky top-28 self-start">
                <div
                  ref={sidebarNavRef}
                  className="max-h-[calc(100vh-8.5rem)] overflow-y-auto overscroll-contain dh-no-scrollbar scrollbar-none space-y-4 pr-1"
                >
                  {/* Card 1: Document Sections (Table of Contents) */}
                  {sections.length > 0 && (
                    <div className="rounded-[26px] border border-black/[0.07] dark:border-white/10 bg-white/90 dark:bg-[#0c1e17]/90 backdrop-blur-xl p-4 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)]">
                      <div className="flex items-center justify-between mb-3 px-1 text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        <div className="flex items-center gap-1.5">
                          <Layers className="size-3.5 text-[#0d5a43] dark:text-emerald-400" />
                          <span className="text-[11px] font-bold">Document Sections</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-bold font-mono text-[#0d5a43] dark:text-emerald-400">
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
                              data-active={isActive ? "true" : "false"}
                              onClick={() => scrollToSection(sec.id)}
                              className={cn(
                                "group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-all duration-200 cursor-pointer",
                                isActive
                                  ? "bg-[#0d5a43] text-white shadow-sm font-semibold"
                                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white font-medium"
                              )}
                            >
                              <span className="flex items-center gap-2 truncate pr-2">
                                <span
                                  className={cn(
                                    "font-mono text-[11px] shrink-0",
                                    isActive
                                      ? "text-emerald-200 font-bold"
                                      : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300"
                                  )}
                                >
                                  {String(idx + 1).padStart(2, "0")}
                                </span>
                                <span className="truncate">{sec.label}</span>
                              </span>

                              {isActive ? (
                                <span className="size-1.5 rounded-full bg-emerald-300 shrink-0" />
                              ) : (
                                <ChevronRight className="size-3 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </nav>
                    </div>
                  )}

                  {/* Card 2: Legal Repository (All Policies Switcher) */}
                  <div className="rounded-[26px] border border-black/[0.07] dark:border-white/10 bg-white/90 dark:bg-[#0c1e17]/90 backdrop-blur-xl p-4 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center gap-1.5 mb-3 px-1 text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      <FileText className="size-3.5 text-[#0d5a43] dark:text-emerald-400" />
                      <span className="text-[11px] font-bold">Legal Documents</span>
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
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-[#0d5a43] dark:text-emerald-300 font-bold border border-emerald-500/20 shadow-2xs"
                                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-white/5 font-medium"
                              )}
                            >
                              <span>{link.label}</span>
                              {isCurrent && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0d5a43] dark:text-emerald-400 uppercase tracking-wider">
                                  <CheckCircle2 className="size-3 text-[#0d5a43] dark:text-emerald-400" />
                                  Active
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Card 3: Direct Legal Inquiries Callout */}
                  <div className="rounded-2xl border border-neutral-200/60 dark:border-white/5 bg-neutral-100/60 dark:bg-white/[0.02] p-3 text-xs text-neutral-500 dark:text-neutral-400 flex items-start gap-2.5">
                    <Mail className="size-4 text-[#0d5a43] dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="block font-semibold text-neutral-900 dark:text-white text-[11.5px]">
                        Need Clarification?
                      </span>
                      <a
                        href="mailto:contact.dochomoeo@gmail.com"
                        className="text-[11px] text-[#0d5a43] dark:text-emerald-400 hover:underline truncate block font-medium mt-0.5"
                      >
                        contact.dochomoeo@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </aside>

              {/* ============================================================ */}
              {/* RIGHT CONTENT: Elegant Continuous Flow (One Single Scrollbar) */}
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
                          "scroll-mt-32 rounded-[28px] border p-6 sm:p-9 md:p-11 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.02)]",
                          isActive
                            ? "border-[#0d5a43]/30 dark:border-emerald-500/30 bg-white dark:bg-[#0c1e17]/60 ring-2 ring-[#0d5a43]/10 shadow-[0_12px_40px_-15px_rgba(13,90,67,0.08)]"
                            : "border-neutral-200/70 dark:border-white/10 bg-white/80 dark:bg-[#0c1e17]/25 hover:border-neutral-300 dark:hover:border-white/15"
                        )}
                      >
                        {/* Section Header Meta */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 dark:border-white/10 pb-4 mb-5">
                          <div className="flex items-center gap-2.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-white/10 border border-neutral-200/60 dark:border-white/10 px-3 py-1 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                              <span className="font-mono text-[11px]">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <span className="size-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                              <span>
                                Section {idx + 1} of {sections.length}
                              </span>
                            </span>

                            {isActive && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0d5a43] dark:text-emerald-400 animate-in fade-in">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active Section
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 tracking-wide">
                            #{sec.id}
                          </span>
                        </div>

                        {/* Section Heading */}
                        <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-4 leading-snug tracking-tight">
                          {sec.title || sec.label}
                        </h2>

                        {/* Rich Section Content */}
                        <div className="legal-content prose prose-neutral max-w-none text-neutral-700 dark:text-neutral-300 text-[14.5px] sm:text-[15.5px] leading-[1.8] space-y-3.5">
                          {sec.content}
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="legal-content prose prose-neutral max-w-none rounded-[28px] border border-neutral-200/80 bg-white dark:bg-[#0c1e17]/40 p-6 sm:p-9 md:p-11 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    {children}
                  </div>
                )}

                {/* Callout box (Support email, Archival notes, Legal inquiries) */}
                {callout && (
                  <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 sm:p-8 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed shadow-xs">
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
