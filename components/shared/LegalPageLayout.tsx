"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Layers,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { getLenis } from "@/components/providers/SmoothScrollProvider";
import { cn } from "@/lib/utils";

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
 * Keeps the desktop sidebar pinned in the viewport while the content pane
 * scrolls naturally, with automatic scroll-spy section tracking and smooth
 * click navigation that maintains frame stability.
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
  const [activeId, setActiveId] = useState<string>("all");
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle deep-link hashes on mount without harsh jumping
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && sections.some((s) => s.id === hash)) {
        setActiveId(hash);
        const el = document.getElementById(hash);
        if (el) {
          const targetTop = el.getBoundingClientRect().top + window.scrollY - 110;
          const lenis = getLenis();
          if (lenis) {
            lenis.scrollTo(targetTop, { immediate: true });
          } else {
            window.scrollTo({ top: targetTop, behavior: "instant" });
          }
        }
      }
    };

    const timer = setTimeout(handleHash, 100);
    window.addEventListener("hashchange", handleHash);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", handleHash);
    };
  }, [sections]);

  // Scroll Spy: dynamically highlight section as user scrolls down the page
  useEffect(() => {
    if (sections.length === 0) return;

    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) return;

      const contentEl = document.getElementById("legal-content-container");
      if (!contentEl) return;

      // When scrolled above content container, mark as "all"
      if (window.scrollY < contentEl.offsetTop - 140) {
        setActiveId("all");
        return;
      }

      // Check which section is in view (with header offset)
      const scrollPosition = window.scrollY + 130;
      let currentId = sections[0].id;

      for (let i = 0; i < sections.length; i++) {
        const sectionEl = document.getElementById(sections[i].id);
        if (sectionEl) {
          const top = sectionEl.offsetTop;
          if (scrollPosition >= top - 20) {
            currentId = sections[i].id;
          }
        }
      }

      setActiveId((prev) => {
        if (prev !== currentId) {
          window.history.replaceState(null, "", `#${currentId}`);
          return currentId;
        }
        return prev;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    const lenis = getLenis();
    if (lenis) {
      lenis.on("scroll", handleScroll);
    }

    // Initial measurement
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (lenis) {
        lenis.off("scroll", handleScroll);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [sections]);

  // Mobile horizontal tab centering
  useEffect(() => {
    if (activeId && activeId !== "all") {
      const tabEl = document.getElementById(`mobile-tab-${activeId}`);
      if (tabEl) {
        tabEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [activeId]);

  const handleSelectSection = (id: string) => {
    setActiveId(id);
    isProgrammaticScrollRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    if (id === "all") {
      window.history.replaceState(null, "", window.location.pathname);
      const contentEl = document.getElementById("legal-content-container");
      const targetTop = contentEl
        ? contentEl.getBoundingClientRect().top + window.scrollY - 110
        : 0;

      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(targetTop, { duration: 0.8 });
      } else {
        window.scrollTo({ top: targetTop, behavior: "smooth" });
      }
    } else {
      window.history.replaceState(null, "", `#${id}`);
      const sectionEl = document.getElementById(id);
      if (sectionEl) {
        const targetTop = sectionEl.getBoundingClientRect().top + window.scrollY - 110;
        const lenis = getLenis();
        if (lenis) {
          lenis.scrollTo(targetTop, { duration: 0.8 });
        } else {
          window.scrollTo({ top: targetTop, behavior: "smooth" });
        }
      }
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 850);
  };

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-canvas">
        {/* ============================================================== */}
        {/* Hero Band                                                      */}
        {/* ============================================================== */}
        <section className="dh-band-sage relative overflow-hidden pt-28 pb-10 md:pt-36 md:pb-14 border-b border-line-soft/60">
          <Container width="wide" className="relative z-10 max-w-6xl">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest-deep/70 transition-colors hover:text-forest-deep"
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
                  <p className="mt-3 text-base sm:text-lg leading-relaxed text-muted-ink">
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
        {/* Mobile / Tablet Horizontal Section Tabs (Sticky below header)  */}
        {/* ============================================================== */}
        {sections.length > 0 && (
          <div className="sticky top-[64px] sm:top-[68px] z-30 bg-paper/95 backdrop-blur-md border-b border-line-soft lg:hidden shadow-2xs">
            <div className="flex items-center gap-2 overflow-x-auto px-4 py-2.5 scrollbar-none">
              <button
                type="button"
                onClick={() => handleSelectSection("all")}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer border",
                  activeId === "all"
                    ? "bg-forest-deep text-white border-forest-deep shadow-xs"
                    : "bg-canvas text-muted-ink border-line-soft hover:text-ink"
                )}
              >
                All
              </button>
              {sections.map((sec, idx) => {
                const isActive = activeId === sec.id;
                return (
                  <button
                    key={sec.id}
                    id={`mobile-tab-${sec.id}`}
                    type="button"
                    onClick={() => handleSelectSection(sec.id)}
                    className={cn(
                      "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer border",
                      isActive
                        ? "bg-forest-deep text-white border-forest-deep shadow-xs"
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
        {/* Main Content Area (Sidebar stays pinned; content is scrollable)*/}
        {/* ============================================================== */}
        <section className="py-8 md:py-12">
          <Container width="wide" className="max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-12 items-stretch">
              {/* Desktop Left Sidebar: Pinned in viewport throughout scroll */}
              <aside className="hidden lg:block self-stretch">
                <div className="sticky top-24 space-y-6 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 scrollbar-thin">
                  {/* Document Sections Navigator */}
                  {sections.length > 0 && (
                    <div className="rounded-2xl border border-line-soft bg-paper p-4 shadow-xs">
                      <div className="flex items-center justify-between mb-3 px-1 text-xs font-bold uppercase tracking-wider text-muted-ink">
                        <div className="flex items-center gap-2">
                          <Layers className="size-3.5 text-forest-deep" />
                          <span>Document Sections</span>
                        </div>
                        <span className="text-[11px] font-mono text-muted-ink/70">
                          {sections.length} parts
                        </span>
                      </div>

                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => handleSelectSection("all")}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-all cursor-pointer",
                            activeId === "all"
                              ? "bg-forest-deep text-white shadow-xs font-bold"
                              : "text-muted-ink hover:bg-sage-wash/50 hover:text-forest-deep"
                          )}
                        >
                          <BookOpen className="size-3.5 shrink-0" />
                          <span>Complete Document</span>
                        </button>

                        <div className="my-2 border-t border-line-soft/60" />

                        {sections.map((sec, idx) => {
                          const isActive = activeId === sec.id;
                          return (
                            <button
                              key={sec.id}
                              type="button"
                              onClick={() => handleSelectSection(sec.id)}
                              className={cn(
                                "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-all cursor-pointer",
                                isActive
                                  ? "bg-forest-deep text-white shadow-xs font-bold"
                                  : "text-muted-ink hover:bg-sage-wash/50 hover:text-forest-deep"
                              )}
                            >
                              <span className="truncate pr-2">
                                <span className="font-mono text-[11px] opacity-70 mr-1.5">
                                  {String(idx + 1).padStart(2, "0")}
                                </span>
                                {sec.label}
                              </span>
                              {isActive && (
                                <span className="size-1.5 rounded-full bg-cream shrink-0 animate-pulse" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* All Legal Policy Documents Directory */}
                  <div className="rounded-2xl border border-line-soft bg-paper p-4 shadow-xs">
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
                                <span className="text-[10px] font-bold text-forest-deep uppercase">
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

              {/* Right Content Pane: Continuously scrollable across all sections */}
              <div className="min-w-0 flex-1">
                <div
                  id="legal-content-container"
                  className="rounded-3xl border border-line-soft bg-paper p-6 sm:p-9 md:p-10 shadow-soft space-y-12"
                >
                  {sections.length > 0 ? (
                    sections.map((sec, idx) => {
                      const isActive = activeId === sec.id;
                      return (
                        <article
                          key={sec.id}
                          id={sec.id}
                          className={cn(
                            "scroll-mt-28 space-y-4 pb-10 border-b border-line-soft/70 last:border-b-0 last:pb-0 transition-colors duration-200",
                            isActive && "relative"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors",
                                isActive
                                  ? "bg-forest-deep text-white shadow-2xs"
                                  : "bg-sage-wash/80 text-forest-deep"
                              )}
                            >
                              Section {String(idx + 1).padStart(2, "0")}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleSelectSection(sec.id)}
                              className="text-xs font-semibold text-muted-ink/70 hover:text-forest-deep transition-colors cursor-pointer"
                              title="Link to this section"
                            >
                              #{sec.id}
                            </button>
                          </div>

                          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-ink">
                            {sec.title || sec.label}
                          </h2>

                          <div className="legal-content prose prose-neutral max-w-none text-ink/90 text-sm sm:text-base leading-relaxed">
                            {sec.content}
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="legal-content prose prose-neutral max-w-none">
                      {children}
                    </div>
                  )}
                </div>

                {/* Callout box (Support email / help) */}
                {callout && (
                  <div className="mt-8 rounded-2xl border border-line-soft bg-paper p-5 sm:p-6 shadow-xs legal-callout text-xs sm:text-sm text-ink leading-relaxed">
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
