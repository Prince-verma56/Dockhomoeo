"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Container } from "@/components/shared/Container";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { User, Package, MapPin, Settings, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const accountNav = [
  { name: "Overview", href: "/account", icon: User },
  { name: "My Orders", href: "/account/orders", icon: Package },
  { name: "Addresses", href: "/account/addresses", icon: MapPin },
  { name: "Profile", href: "/account/profile", icon: Settings },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { status, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=" + encodeURIComponent(pathname));
    }
  }, [status, pathname, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f2ea]">
        <div className="size-8 animate-spin rounded-full border-2 border-forest-deep border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f2ea]">
      <SiteHeader />
      
      <main className="flex-1 pt-[80px] sm:pt-[100px] pb-24">
        <div className="bg-forest-abyss py-12 md:py-16 lg:py-20 text-cream mb-8 md:mb-12">
          <Container width="wide">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white drop-shadow-sm">
              My Account
            </h1>
            <p className="mt-4 text-cream/70 text-lg">
              Manage your orders, prescriptions, and profile.
            </p>
          </Container>
        </div>

        <Container width="wide">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
            
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 lg:w-72 shrink-0">
              <nav className="flex flex-col space-y-1">
                {accountNav.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200",
                        isActive 
                          ? "bg-forest-deep/10 text-forest-deep shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]" 
                          : "text-muted-ink hover:bg-forest-deep/5 hover:text-ink"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("size-5", isActive ? "text-forest-deep" : "text-muted-ink")} />
                        {item.name}
                      </div>
                      <ChevronRight className={cn(
                        "size-4 transition-transform duration-200",
                        isActive ? "text-forest-deep translate-x-1" : "text-transparent group-hover:text-muted-ink group-hover:translate-x-0 -translate-x-2"
                      )} />
                    </Link>
                  );
                })}
                <button
                  onClick={() => logout()}
                  className="group flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 mt-4"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="size-5" />
                    Log Out
                  </div>
                </button>
              </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {children}
            </div>

          </div>
        </Container>
      </main>

      <SiteFooter />
    </div>
  );
}
