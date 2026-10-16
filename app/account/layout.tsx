"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { CalendarClock, ChevronRight, ClipboardList, Loader2, LogOut, MapPin, Package, Settings, User } from "lucide-react";
import { displayName, useAuth } from "@/components/providers/AuthProvider";
import { Container } from "@/components/shared/Container";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { loginHref } from "@/lib/auth/navigation";
import { cn } from "@/lib/utils";

const accountNav = [
  { name: "Overview", href: "/account", icon: User },
  { name: "Consultations", href: "/account/consultations", icon: CalendarClock },
  { name: "My orders", href: "/account/orders", icon: Package },
  { name: "Prescriptions", href: "/account/prescriptions", icon: ClipboardList },
  { name: "Addresses", href: "/account/addresses", icon: MapPin },
  { name: "Profile", href: "/account/profile", icon: Settings },
];

const isCurrent = (pathname: string, href: string) =>
  href === "/account" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

/**
 * The signed-in customer's area. The session is checked by AuthProvider
 * (GET /api/auth/session); every page below also gets a 401 from the backend
 * if it is not this customer's, so this guard is for the reader, not for
 * security. Signed out:
 *   - by "Log out" → back to the homepage;
 *   - session expired, or never signed in → /login, returning here afterwards.
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { status, reason, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "unauthenticated") return;
    if (reason === "logout") router.replace("/");
    else router.replace(loginHref(pathname, reason === "expired" ? "expired" : undefined));
  }, [status, reason, pathname, router]);

  if (status !== "authenticated") {
    return (
      <div role="status" className="flex min-h-dvh items-center justify-center bg-canvas">
        <Loader2 aria-hidden className="size-7 animate-spin text-forest" />
        <span className="sr-only">{status === "loading" ? "Loading your account…" : "Redirecting…"}</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <SiteHeader />

      <main id="main" className="flex-1 pb-20 sm:pb-24">
        <div className="dh-head-arc dh-page-top mb-8 md:mb-12">
          <Container width="wide">
            <h1 className="dh-title-page text-ink">My account</h1>
            <p className="mt-3 text-base text-muted-ink sm:text-lg">
              {user ? `Hello, ${displayName(user)}. ` : null}Your consultations, orders, prescriptions, addresses and profile.
            </p>
          </Container>
        </div>

        <Container width="wide">
          <div className="flex flex-col gap-8 md:flex-row lg:gap-14">
            <aside className="w-full shrink-0 md:w-60 lg:w-64">
              {/* Phones: a scrollable row of sections. From md: a column. */}
              <nav aria-label="Account" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:overflow-visible md:px-0">
                <ul className="flex gap-2 md:flex-col md:gap-1">
                  {accountNav.map((item) => {
                    const active = isCurrent(pathname, item.href);
                    return (
                      <li key={item.href} className="shrink-0">
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "group flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:outline-none md:py-3",
                            active
                              ? "bg-forest/8 text-forest-deep"
                              : "border border-line/70 text-muted-ink hover:bg-forest/5 hover:text-ink md:border-transparent",
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <item.icon aria-hidden className={cn("size-4.5", active ? "text-forest" : "text-muted-ink")} strokeWidth={1.7} />
                            {item.name}
                          </span>
                          <ChevronRight
                            aria-hidden
                            className={cn("hidden size-4 md:block", active ? "text-forest" : "text-transparent group-hover:text-muted-ink")}
                          />
                        </Link>
                      </li>
                    );
                  })}
                  <li className="shrink-0 md:mt-3 md:border-t md:border-line/70 md:pt-3">
                    <button
                      type="button"
                      onClick={() => void logout()}
                      className="flex w-full items-center gap-3 rounded-xl border border-line/70 px-4 py-2.5 text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive/6 focus-visible:ring-2 focus-visible:ring-destructive/30 focus-visible:outline-none md:border-transparent md:py-3"
                    >
                      <LogOut aria-hidden className="size-4.5" strokeWidth={1.7} />
                      Log out
                    </button>
                  </li>
                </ul>
              </nav>
            </aside>

            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </Container>
      </main>

      <SiteFooter />
    </div>
  );
}
