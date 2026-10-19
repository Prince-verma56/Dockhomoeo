"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchPalette, SearchTrigger } from "@/components/search/SearchPalette";
import { Wordmark } from "@/components/navigation/Wordmark";
import { MobileNav } from "@/components/navigation/MobileNav";
import { ShopMegaMenu } from "@/components/navigation/ShopMegaMenu";
import { DeliveryLocationSelector } from "@/components/navigation/DeliveryLocationSelector";
import { isActivePath, primaryNav, type NavLink } from "@/components/navigation/navLinks";
import { useHeroPlayback } from "@/components/providers/HeroPlaybackContext";
import { useCart } from "@/components/providers/CartProvider";
import { useFavourites } from "@/lib/favourites/favourites";
import { useAuth } from "@/components/providers/AuthProvider";
import { AccountMenu } from "@/components/navigation/AccountMenu";
import { MagneticDockContainer, MagneticItem } from "@/components/ui/magnetic-dock";

/**
 * SiteHeader — premium two-row navigation system:
 *
 * 1. Primary Row:
 *    - DocHomoeo Logo & Brand Identity
 *    - Compact Delivery Location / Pincode Checker (synced with localStorage & backend)
 *    - Prominent Search Bar (connected to backend suggestions with keyboard shortcut)
 *    - Resized & High-Visibility Action Dock (Favourites with clean shoulder badge, Cart with live count, User Profile)
 *
 * 2. Secondary Row (Desktop):
 *    - Shop (with mega menu dropdown)
 *    - Doctors, Brands, Categories, Health Insights, Contact
 *    - Quick trust & support indicators
 *
 * Smooth scroll transition:
 * - Transparent on the homepage hero, smoothly transitioning into frosted light glass on scroll.
 * - Solid/translucent frosted glass on internal pages for consistent contrast & readability.
 */

const NAV_SURFACE_HOME = {
  backgroundColor: "rgb(255 255 255 / calc(var(--nav-p, 0) * 0.90))",
  backdropFilter: "blur(calc(var(--nav-p, 0) * 16px)) saturate(calc(1 + var(--nav-p, 0) * 0.35))",
  WebkitBackdropFilter: "blur(calc(var(--nav-p, 0) * 16px)) saturate(calc(1 + var(--nav-p, 0) * 0.35))",
  borderBottomColor: "rgb(20 37 31 / calc(var(--nav-p, 0) * 0.08))",
  boxShadow: "0 10px 30px -15px rgb(20 37 31 / calc(var(--nav-p, 0) * 0.20))",
} as const;

const NAV_SURFACE_INTERNAL = {
  backgroundColor: "rgb(255 255 255 / 0.94)",
  backdropFilter: "blur(18px) saturate(1.4)",
  WebkitBackdropFilter: "blur(18px) saturate(1.4)",
  borderBottomColor: "rgb(20 37 31 / 0.08)",
  boxShadow: "0 8px 26px -12px rgb(20 37 31 / 0.12)",
} as const;

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isPastHero, setIsPastHero] = useState(!isHome);
  const headerRef = useRef<HTMLElement>(null);

  const heroPlayback = useHeroPlayback();
  const isNavVisible = !isHome || (heroPlayback ? heroPlayback.navVisible : true);

  const { itemCount, setIsOpen } = useCart();
  const { count: savedCount } = useFavourites();
  const { status, isAuthenticated } = useAuth();

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    if (!isHome) {
      header.style.setProperty("--nav-p", "1");
      setIsPastHero(true);
      return;
    }

    const [start, end] = [340, 540];
    let frame = 0;
    let past: boolean | null = null;

    const update = () => {
      frame = 0;
      const progress = Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)));
      header.style.setProperty("--nav-p", progress.toFixed(3));
      const nowPast = progress >= 0.5;
      if (nowPast !== past) {
        past = nowPast;
        setIsPastHero(nowPast);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [isHome]);

  const navItemClass = cn(
    "inline-flex h-8.5 items-center rounded-full bg-transparent px-3.5 text-[0.875rem] font-semibold whitespace-nowrap transition-colors duration-150 ease-out cursor-pointer",
    "text-[#14251f] hover:bg-[#0d5a43]/10 hover:text-[#0d5a43] dark:text-cream/90 dark:hover:text-emerald-400",
    !isPastHero && isHome && "drop-shadow-[0_1px_3px_rgba(255,255,255,0.85)]",
  );

  return (
    <header
      ref={headerRef}
      style={isHome ? NAV_SURFACE_HOME : NAV_SURFACE_INTERNAL}
      className={cn(
        "fixed inset-x-0 top-0 z-50 px-3 sm:px-6 lg:px-8 py-1.5 sm:py-2",
        "transition-[translate,opacity,border-color,background-color] duration-500 ease-premium",
        isHome && !isPastHero ? "border-b border-transparent" : "border-b border-black/[0.06] dark:border-white/10",
        isNavVisible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0",
      )}
    >
      <div className="mx-auto max-w-[1360px]">
        {/* ================================================================= */}
        {/* ROW 1: PRIMARY ROW — BRAND, LOCATION, SEARCH & ACTION DOCK        */}
        {/* ================================================================= */}
        <div className="flex h-14 sm:h-15 items-center justify-between gap-3 sm:gap-4 lg:gap-6">
          {/* Left Group: Mobile Trigger + Wordmark Brand Logo (Clean, spacious & uncrowded) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center lg:hidden">
              <MobileNav />
            </div>
            <Wordmark className="shrink-0" isNavVisible={isNavVisible} />
          </div>

          {/* Center Group: Live Search Bar + Delivery Location (Positioned to the right of search, away from logo) */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-2.5 lg:gap-3.5 max-w-[760px] xl:max-w-[840px] mx-auto px-2">
            <SearchTrigger variant="header" className="flex-1 min-w-0" />
            <DeliveryLocationSelector className="shrink-0" />
          </div>

          {/* Right Group: Action Dock + Mobile Triggers */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Mobile Pincode Selector (< md) */}
            <div className="md:hidden">
              <DeliveryLocationSelector compact />
            </div>

            {/* Mobile Search Icon Trigger (< md) */}
            <div className="md:hidden">
              <SearchTrigger variant="icon" />
            </div>
            <SearchPalette />

            {/* Action Dock: Wishlist, Cart & Profile with generous gap for independent hovering */}
            <MagneticDockContainer className="flex items-center gap-4 sm:gap-4.5 lg:gap-5">
              {/* Wishlist / Favourites */}
              <MagneticItem
                maxScale={1.08}
                magneticDistance={26}
                maxFloat={1.5}
                tooltip={savedCount > 0 ? `${savedCount} saved` : "Favourites"}
                tooltipPosition="bottom"
              >
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "relative size-10 rounded-full text-[#14251f] hover:bg-black/8 hover:text-[#0d5a43] transition-colors cursor-pointer",
                    !isPastHero && isHome && "hover:bg-white/40"
                  )}
                >
                  <Link
                    href="/favourites"
                    aria-label={savedCount > 0 ? `Favourites, ${savedCount} saved` : "Favourites"}
                    className="relative grid size-full place-items-center"
                  >
                    <Heart
                      className={cn(
                        "size-5 sm:size-[21px] transition-colors",
                        savedCount > 0 ? "text-[#0d5a43] fill-[#0d5a43]/20" : "text-[#14251f]"
                      )}
                      strokeWidth={1.9}
                    />
                    {savedCount > 0 && (
                      <span
                        aria-hidden
                        className="absolute -top-1 -right-1.5 sm:-top-1.5 sm:-right-2 z-10 grid min-w-[17px] h-[17px] px-1 place-items-center rounded-full bg-[#0d5a43] text-[9.5px] font-bold text-white shadow-xs ring-2 ring-white dark:ring-[#07130e] pointer-events-none"
                      >
                        {savedCount > 99 ? "99+" : savedCount}
                      </span>
                    )}
                  </Link>
                </Button>
              </MagneticItem>

              {/* Shopping Cart */}
              <MagneticItem
                maxScale={1.08}
                magneticDistance={26}
                maxFloat={1.5}
                tooltip={itemCount > 0 ? `${itemCount} items` : "Cart"}
                tooltipPosition="bottom"
              >
                <Button
                  onClick={() => setIsOpen(true)}
                  variant="ghost"
                  size="icon"
                  aria-label={`Cart, ${itemCount} items`}
                  className={cn(
                    "relative size-10 rounded-full text-[#14251f] hover:bg-black/8 hover:text-[#0d5a43] transition-colors cursor-pointer",
                    !isPastHero && isHome && "hover:bg-white/40"
                  )}
                >
                  <ShoppingBag className="size-5 sm:size-[21px]" strokeWidth={1.9} />
                  {itemCount > 0 && (
                    <span
                      aria-hidden
                      className="absolute -top-1 -right-1.5 sm:-top-1.5 sm:-right-2 z-10 grid min-w-[17px] h-[17px] px-1 place-items-center rounded-full bg-[#e11d48] text-[9.5px] font-bold text-white shadow-xs ring-2 ring-white dark:ring-[#07130e] pointer-events-none"
                    >
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </Button>
              </MagneticItem>

              {/* User Account: Avatar menu (Logged In) or Person Icon Button (Logged Out) */}
              {status === "loading" ? null : isAuthenticated ? (
                <AccountMenu />
              ) : (
                <MagneticItem
                  maxScale={1.08}
                  magneticDistance={26}
                  maxFloat={1.5}
                  tooltip="Sign In / Register"
                  tooltipPosition="bottom"
                >
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "relative size-10 rounded-full text-[#14251f] hover:bg-black/8 hover:text-[#0d5a43] transition-colors cursor-pointer",
                      !isPastHero && isHome && "hover:bg-white/40"
                    )}
                  >
                    <Link
                      href="/login"
                      aria-label="Sign In or Register"
                      className="relative grid size-full place-items-center"
                    >
                      <User className="size-5 sm:size-[21px]" strokeWidth={1.9} />
                    </Link>
                  </Button>
                </MagneticItem>
              )}
            </MagneticDockContainer>
          </div>
        </div>

        {/* ================================================================= */}
        {/* ROW 2: CENTERED PRIMARY NAVIGATION DESTINATIONS (Desktop, >= lg)  */}
        {/* ================================================================= */}
        <nav
          aria-label="Primary navigation categories and destinations"
          className={cn(
            "hidden lg:flex h-9.5 items-center justify-center transition-colors duration-300 mt-0.5",
            isHome && !isPastHero ? "border-t border-transparent" : "border-t border-black/[0.07] dark:border-white/10 pt-0.5"
          )}
        >
          <MagneticDockContainer className="flex items-center justify-center">
            <ul className="flex items-center justify-center gap-1.5 sm:gap-2 xl:gap-3 mx-auto">
              <ShopMegaMenu className={navItemClass} active={isActivePath(pathname, "/products")} />
              {primaryNav.slice(1).map((item: NavLink) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <li key={item.href}>
                    <MagneticItem
                      maxScale={1.05}
                      magneticDistance={60}
                      maxFloat={1.5}
                    >
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(navItemClass, active && "bg-[#0d5a43]/10 text-[#0d5a43]")}
                      >
                        {item.label}
                      </Link>
                    </MagneticItem>
                  </li>
                );
              })}
            </ul>
          </MagneticDockContainer>
        </nav>
      </div>
    </header>
  );
}
