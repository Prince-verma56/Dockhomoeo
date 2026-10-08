"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Headset, Menu, PackageCheck, User } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/shared/SearchBar";
import { Separator } from "@/components/ui/separator";
import { Wordmark } from "@/components/navigation/Wordmark";
const primaryNav = [{ label: "Shop", href: "/products" },{ label: "Brands", href: "/brands" },{ label: "Categories", href: "/categories" },{ label: "Health Insights", href: "/insights" }] as const; const shopMenu = { byForm: [{ label: "Drops & Dilutions", href: "/products?form=drops" },{ label: "Tablets & Pellets", href: "/products?form=tablets" },{ label: "Mother Tinctures", href: "/products?form=tincture" },{ label: "Creams & Ointments", href: "/products?form=cream" }], byGoal: [{ label: "Immunity", href: "/products?goal=immunity" },{ label: "Skin Care", href: "/products?goal=skin-care" },{ label: "Digestive", href: "/products?goal=digestive" },{ label: "Sleep & Stress", href: "/products?goal=sleep-stress" }] } as const; const healthGoals = [{ id: "immunity", name: "Immunity", href: "/products?goal=immunity" }, { id: "skin-care", name: "Skin Care", href: "/products?goal=skin-care" }];

/**
 * Mobile navigation drawer.
 *
 * Mobile gets its own information architecture rather than the desktop menu
 * stacked: search first, then primary destinations, then the health goals that
 * the desktop header hides inside the Shop panel
 * (brain/17_DECISIONS.md D010).
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Open menu"
          className="size-11 rounded-xl text-ink hover:bg-forest/8"
        >
          <Menu className="size-5" strokeWidth={1.6} />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex w-[min(92vw,380px)] flex-col gap-0 border-white/40 bg-white/60 backdrop-blur-2xl p-0 shadow-2xl"
      >
        <SheetHeader className="border-b border-line/70 p-5">
          <SheetTitle asChild>
            <div>
              <Wordmark showTagline={false} />
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Browse medicines, doctors and account options
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overscroll-contain p-5">
          <form role="search" action="/search">
            <label htmlFor="mobile-search" className="sr-only">
              Search medicines, doctors and symptoms
            </label>
            <SearchBar
              id="mobile-search"
              name="q"
              placeholder="Search medicines, doctors…"
              className="h-11 rounded-xl bg-white/50 backdrop-blur-md text-sm border-white/40 shadow-sm"
            />
          </form>

          <nav aria-label="Main" className="mt-6">
            <ul className="flex flex-col">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <SheetClose asChild>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between border-b border-line/60 py-3.5 text-[1.0625rem] text-ink transition-colors hover:text-forest"
                    >
                      {item.label}
                      <ChevronRight
                        aria-hidden
                        className="size-4 text-muted-ink"
                        strokeWidth={1.6}
                      />
                    </Link>
                  </SheetClose>
                </li>
              ))}
            </ul>
          </nav>

          <section className="mt-7" aria-labelledby="mobile-goals">
            <h2 id="mobile-goals" className="dh-eyebrow text-muted-ink">
              Shop by health goal
            </h2>
            <ul className="mt-3.5 flex flex-wrap gap-2">
              {healthGoals.map((goal) => (
                <li key={goal.id}>
                  <SheetClose asChild>
                    <Link
                      href={goal.href}
                      className="inline-flex rounded-full border border-line bg-cream px-3.5 py-2 text-[0.8125rem] text-ink transition-colors hover:border-forest/30 hover:text-forest"
                    >
                      {goal.name}
                    </Link>
                  </SheetClose>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-7" aria-labelledby="mobile-forms">
            <h2 id="mobile-forms" className="dh-eyebrow text-muted-ink">
              Shop by form
            </h2>
            <ul className="mt-3 flex flex-col">
              {shopMenu.byForm.map((item) => (
                <li key={item.href}>
                  <SheetClose asChild>
                    <Link
                      href={item.href}
                      className="block py-2.5 text-sm text-muted-ink transition-colors hover:text-forest"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="border-t border-line/70 bg-cream p-5">
          <Button asChild variant="brand" size="xl" className="w-full">
            <Link href="/login">
              <User className="size-4" strokeWidth={1.7} />
              Login / Register
            </Link>
          </Button>

          <Separator className="my-4 bg-line/70" />

          <div className="flex items-center justify-between text-[0.8125rem] text-muted-ink">
            <Link
              href="/user/orders"
              className="flex items-center gap-2 transition-colors hover:text-forest"
            >
              <PackageCheck aria-hidden className="size-4" strokeWidth={1.6} />
              Track Order
            </Link>
            <Link
              href="/inquiry"
              className="flex items-center gap-2 transition-colors hover:text-forest"
            >
              <Headset aria-hidden className="size-4" strokeWidth={1.6} />
              Help
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
