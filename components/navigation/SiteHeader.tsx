"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchPalette, SearchTrigger } from "@/components/search/SearchPalette";
import { Wordmark } from "@/components/navigation/Wordmark";
import { MobileNav } from "@/components/navigation/MobileNav";
import { ShopMegaMenu } from "@/components/navigation/ShopMegaMenu";
import { isActivePath, primaryNav, type NavLink } from "@/components/navigation/navLinks";
import { useHeroPlayback } from "@/components/providers/HeroPlaybackContext";
import { useCart } from "@/components/providers/CartProvider";
import { useFavourites } from "@/lib/favourites/favourites";
import { useAuth } from "@/components/providers/AuthProvider";
import { AccountMenu } from "@/components/navigation/AccountMenu";

/**
 * SiteHeader — one header for every route.
 *
 * At the top of a page it is transparent (over the homepage hero video it
 * also waits for HeroPlaybackProvider before appearing). As the page scrolls
 * it settles, continuously, into a softly frosted light bar: one passive,
 * rAF-throttled scroll listener writes a 0–1 progress value to `--nav-p`, and
 * background opacity, blur, hairline and shadow are all derived from it in
 * CSS. React only re-renders when the header crosses the halfway point.
 *
 * The header never changes height or hides on scroll, so nothing below it
 * shifts and sticky elements (the shop's filter sidebar) can rely on it.
 */
const NAV_SURFACE = {
  backgroundColor: "rgb(255 255 255 / calc(var(--nav-p, 0) * 0.82))",
  backdropFilter: "blur(calc(var(--nav-p, 0) * 14px)) saturate(calc(1 + var(--nav-p, 0) * 0.35))",
  WebkitBackdropFilter: "blur(calc(var(--nav-p, 0) * 14px)) saturate(calc(1 + var(--nav-p, 0) * 0.35))",
  borderBottomColor: "rgb(20 37 31 / calc(var(--nav-p, 0) * 0.08))",
  boxShadow: "0 12px 32px -22px rgb(20 37 31 / calc(var(--nav-p, 0) * 0.28))",
} as const;

export function SiteHeader() {
  const [isPastHero, setIsPastHero] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const pathname = usePathname();
  const isHome = pathname === "/";
  const heroPlayback = useHeroPlayback();
  const isNavVisible = !isHome || (heroPlayback ? heroPlayback.navVisible : true);

  const { itemCount, setIsOpen } = useCart();
  const { count: savedCount } = useFavourites();
  const { status, isAuthenticated } = useAuth();

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const [start, end] = isHome ? [340, 540] : [0, 96];
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
    "inline-flex h-9 items-center rounded-full bg-transparent px-2.5 text-[0.875rem] font-semibold whitespace-nowrap transition-colors min-[1400px]:px-3.5",
    "text-[#14251f] hover:bg-[#0d5a43]/10 hover:text-[#0d5a43]",
    !isPastHero && "drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]",
  );

  return (
    <header
      ref={headerRef}
      style={NAV_SURFACE}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b px-4 py-3 sm:px-8",
        "transition-[translate,opacity] duration-500 ease-premium",
        // Only the homepage hides it, until the hero video hands over.
        isNavVisible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0",
      )}
    >
      <div className="mx-auto flex h-[58px] sm:h-[62px] max-w-[1400px] items-center gap-3 sm:gap-6">
        {/* Mobile menu trigger */}
        <div className="flex items-center gap-1 lg:hidden">
          <MobileNav />
        </div>

        {/* Wordmark logo */}
        <Wordmark className="shrink-0" />

        {/* Desktop navigation. Every label is a link; Shop's panel opens from
            hover or its own chevron (components/navigation/ShopMegaMenu). */}
        <nav aria-label="Main" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-1 xl:gap-2">
            <ShopMegaMenu className={navItemClass} active={isActivePath(pathname, "/products")} />
            {primaryNav.slice(1).map((item: NavLink) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href} className={cn(item.wideOnly && "hidden min-[1400px]:list-item")}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(navItemClass, active && "bg-[#0d5a43]/10 text-[#0d5a43]")}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right side controls: Search, Wishlist, Cart, Login */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* The full search input field fits comfortably on xl screens (>=1280px);
              below xl (including tablet 768px-1023px and mobile), the compact icon
              prevents header overflow and button clipping. */}
          <div className="hidden xl:block">
            <SearchTrigger />
          </div>

          {/* Search button for viewports below xl */}
          <SearchTrigger variant="icon" className="xl:hidden" />
          <SearchPalette />

          {/* Wishlist Heart */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className={cn(
              "size-9 rounded-full text-[#14251f] hover:bg-black/5 hover:text-[#0d5a43] transition-colors",
              !isPastHero && "hover:bg-white/40"
            )}
          >
            <Link
              href="/favourites"
              aria-label={savedCount > 0 ? `Favourites, ${savedCount} saved` : "Favourites"}
              className="relative"
            >
              <Heart className="size-[18px]" strokeWidth={1.75} />
              {savedCount > 0 ? (
                <span
                  aria-hidden
                  className="absolute top-0.5 right-0.5 grid size-[17px] place-items-center rounded-full bg-[#0d5a43] text-[0.625rem] font-bold text-white shadow-xs"
                >
                  {savedCount > 99 ? "99+" : savedCount}
                </span>
              ) : null}
            </Link>
          </Button>

          {/* Cart with Red Badge */}
          <Button
            onClick={() => setIsOpen(true)}
            variant="ghost"
            size="icon"
            aria-label={`Cart, ${itemCount} items`}
            className={cn(
              "relative size-9 rounded-full text-[#14251f] hover:bg-black/5 hover:text-[#0d5a43] transition-colors",
              !isPastHero && "hover:bg-white/40"
            )}
          >
            <ShoppingBag className="size-[18px]" strokeWidth={1.75} />
            {itemCount > 0 && (
              <span
                aria-hidden
                className="absolute top-0.5 right-0.5 grid size-[17px] place-items-center rounded-full bg-[#e11d48] text-[0.625rem] font-bold text-white shadow-xs"
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Button>

          {/* Account Menu or Login / Register */}
          {status === "loading" ? null : isAuthenticated ? (
            <AccountMenu />
          ) : (
            <Button
              asChild
              className="ml-1 hidden sm:inline-flex h-9 sm:h-9.5 rounded-full bg-[#0d5a43] hover:bg-[#063b2d] text-white px-5 text-[0.8125rem] font-semibold tracking-wide shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Link href="/login">
                Login / Register
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
