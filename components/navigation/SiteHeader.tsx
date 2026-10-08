"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, Search, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Wordmark } from "@/components/navigation/Wordmark";
import { MobileNav } from "@/components/navigation/MobileNav";
const primaryNav = [{ label: "Shop", href: "/products" },{ label: "Brands", href: "/brands" },{ label: "Categories", href: "/categories" },{ label: "Health Insights", href: "/insights" }] as const; const shopMenu = { byForm: [{ label: "Drops & Dilutions", href: "/products?form=drops" },{ label: "Tablets & Pellets", href: "/products?form=tablets" },{ label: "Mother Tinctures", href: "/products?form=tincture" },{ label: "Creams & Ointments", href: "/products?form=cream" }], byGoal: [{ label: "Immunity", href: "/products?goal=immunity" },{ label: "Skin Care", href: "/products?goal=skin-care" },{ label: "Digestive", href: "/products?goal=digestive" },{ label: "Sleep & Stress", href: "/products?goal=sleep-stress" }] } as const;
import { useHeroPlayback } from "@/components/providers/HeroPlaybackContext";
import { useCart } from "@/components/providers/CartProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { AccountMenu } from "@/components/navigation/AccountMenu";

/**
 * SiteHeader
 * 
 * Requirements implemented:
 * 1. On Hero Section:
 *    - Completely transparent background (no background color or card wrapper)
 *    - Text & navigation links clearly visible with crisp contrast
 *    - Appears first at 5 seconds
 * 2. On Other Sections (scrolled past hero):
 *    - Has sleek background color (bg-white/95 with backdrop blur and subtle border/shadow)
 *    - Smart scroll animation:
 *      * Scroll DOWN: navbar hides smoothly (-translate-y-full)
 *      * Scroll UP: navbar reappears (translate-y-0) with background color
 *      * Scroll back to hero top: smoothly returns to transparent without background color
 */
export function SiteHeader() {
  const [isPastHero, setIsPastHero] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);

  const heroPlayback = useHeroPlayback();
  const isNavVisible = heroPlayback ? heroPlayback.navVisible : true;
  
  const { itemCount, setIsOpen } = useCart();
  const { status, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const heroThreshold = 460; // Hero section boundary

      if (currentY <= heroThreshold) {
        // We are on the hero section:
        // Always transparent, always shown once unlocked at 5s
        setIsPastHero(false);
        setIsScrollingDown(false);
      } else {
        // We are past the hero section on other sections:
        setIsPastHero(true);

        const delta = currentY - lastScrollY.current;
        if (delta > 8 && currentY > 520) {
          // Scrolling downwards -> hide navbar
          setIsScrollingDown(true);
        } else if (delta < -8) {
          // Scrolling upwards -> reveal navbar with background color
          setIsScrollingDown(false);
        }
      }

      lastScrollY.current = currentY;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine visibility & translate classes
  const isHidden = !isNavVisible || (isPastHero && isScrollingDown);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-400 ease-out",
        // Position & visibility animations
        isHidden ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100 pointer-events-auto",
        // Background color logic:
        // NO background color on the hero section!
        !isPastHero
          ? "bg-transparent border-b border-transparent shadow-none py-3.5 sm:py-4 px-4 sm:px-8"
          // Applied background color only when on other sections (glassy):
          : "bg-white/40 backdrop-blur-2xl border-b border-white/30 shadow-[0_8px_32px_rgba(20,37,31,0.08)] py-2.5 px-4 sm:px-8"
      )}
    >
      <div className="mx-auto flex h-[58px] sm:h-[62px] max-w-[1400px] items-center gap-3 sm:gap-6">
        {/* Mobile menu trigger */}
        <div className="flex items-center gap-1 lg:hidden">
          <MobileNav />
        </div>

        {/* Wordmark logo */}
        <Wordmark className="shrink-0" />

        {/* Desktop Navigation Links - crisp dark text with clean contrast */}
        <NavigationMenu className="mx-auto hidden lg:flex">
          <NavigationMenuList className="gap-1 xl:gap-2">
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={cn(
                  "h-9 rounded-full bg-transparent px-3.5 text-[0.875rem] font-semibold transition-colors",
                  "text-[#14251f] hover:bg-[#0d5a43]/10 hover:text-[#0d5a43] data-[state=open]:bg-[#0d5a43]/10 data-[state=open]:text-[#0d5a43]",
                  !isPastHero && "drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]"
                )}
              >
                Shop
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[460px] grid-cols-2 gap-x-6 gap-y-1 rounded-3xl bg-white/30 p-5 shadow-[0_16px_42px_rgba(0,0,0,0.05),inset_0_1px_1.5px_rgba(255,255,255,0.8)] backdrop-blur-2xl border border-white/40">
                  <MenuColumn title="By form" links={shopMenu.byForm} />
                  <MenuColumn title="By health goal" links={shopMenu.byGoal} />
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {primaryNav.slice(1).map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink
                  asChild
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "h-9 rounded-full bg-transparent px-3.5 text-[0.875rem] font-semibold transition-colors",
                    "text-[#14251f] hover:bg-[#0d5a43]/10 hover:text-[#0d5a43]",
                    !isPastHero && "drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]"
                  )}
                >
                  <Link href={item.href}>{item.label}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side controls: Search, Wishlist, Cart, Login */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Search bar using shared SearchBar component */}
          <div className="hidden md:block">
            <GlobalSearch />
          </div>

          {/* Search button for small screens */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-9 rounded-full text-[#14251f] hover:bg-black/5 md:hidden"
          >
            <Link href="/search" aria-label="Search">
              <Search className="size-[18px]" strokeWidth={1.75} />
            </Link>
          </Button>

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
            <Link href="/user/favourites" aria-label="Favourites">
              <Heart className="size-[18px]" strokeWidth={1.75} />
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

function MenuColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="dh-eyebrow mb-2.5 text-muted-ink">{title}</p>
      <ul className="flex flex-col">
        {links.map((link) => (
          <li key={link.href}>
            <NavigationMenuLink asChild>
              <Link
                href={link.href}
                className="block rounded-xl px-3 py-2.5 text-[0.875rem] font-medium text-ink/80 transition-all duration-200 hover:bg-white/50 hover:text-forest hover:shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:scale-[1.01]"
              >
                {link.label}
              </Link>
            </NavigationMenuLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
