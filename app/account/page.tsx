"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { Package, MapPin, Settings, ArrowRight } from "lucide-react";

export default function AccountOverviewPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl bg-paper p-8 sm:p-10 shadow-soft border border-line-soft">
        <h2 className="font-display text-3xl font-bold text-ink">
          Welcome back, {user?.firstName || "Guest"}
        </h2>
        <p className="mt-2 text-muted-ink max-w-2xl">
          From your account you can see your orders, keep your delivery addresses and update your profile.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/account/orders"
          className="group flex flex-col items-start rounded-2xl bg-paper p-8 shadow-soft border border-line-soft hover:border-forest/30 hover:shadow-lift transition-all duration-300"
        >
          <div className="rounded-2xl bg-sage-wash p-4 text-forest-deep mb-6 group-hover:scale-105 transition-transform duration-300">
            <Package className="size-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-ink">My Orders</h3>
          <p className="mt-2 text-sm text-muted-ink mb-6">
            See the orders you have placed, their status and what was in them.
          </p>
          <div className="mt-auto flex items-center text-sm font-semibold text-forest">
            View Orders <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/account/addresses"
          className="group flex flex-col items-start rounded-2xl bg-paper p-8 shadow-soft border border-line-soft hover:border-forest/30 hover:shadow-lift transition-all duration-300"
        >
          <div className="rounded-2xl bg-sage-wash p-4 text-forest-deep mb-6 group-hover:scale-105 transition-transform duration-300">
            <MapPin className="size-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-ink">Addresses</h3>
          <p className="mt-2 text-sm text-muted-ink mb-6">
            Manage your saved delivery locations for faster checkout.
          </p>
          <div className="mt-auto flex items-center text-sm font-semibold text-forest">
            Manage Addresses <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/account/profile"
          className="group flex flex-col items-start rounded-2xl bg-paper p-8 shadow-soft border border-line-soft hover:border-forest/30 hover:shadow-lift transition-all duration-300"
        >
          <div className="rounded-2xl bg-sage-wash p-4 text-forest-deep mb-6 group-hover:scale-105 transition-transform duration-300">
            <Settings className="size-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-ink">Profile</h3>
          <p className="mt-2 text-sm text-muted-ink mb-6">
            Update your personal information and account settings.
          </p>
          <div className="mt-auto flex items-center text-sm font-semibold text-forest">
            Edit Profile <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
