"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, ClipboardList, CreditCard, MapPin, Package, Settings, Star, Stethoscope } from "lucide-react";
import { displayName, useAuth } from "@/components/providers/AuthProvider";
import { AccountError, AccountLoading, StatusPill, panelClass } from "@/components/account/AccountStates";
import { ProductThumb } from "@/components/commerce/ProductThumb";
import { repositories } from "@/lib/repositories";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { orderStatus } from "@/lib/account/orderStatus";
import { formatRupees } from "@/lib/formatters/price";
import { formatDate, cn } from "@/lib/utils";
import type { ApiAccountOverview } from "@/types/api/account";

const loadOverview = () => repositories.account.getOverview();

type ToDo = ApiAccountOverview["toDo"][number];

/** Where each kind of to-do the backend lists is done on this site. */
const TODO: Record<ToDo["kind"], { href: (item: ToDo) => string; icon: typeof CreditCard }> = {
  "pay-order": { href: (item) => `/account/orders/${item.id}`, icon: CreditCard },
  "pay-consultation": { href: () => "/account/consultations", icon: CreditCard },
  rate: { href: () => "/account/consultations", icon: Star },
  "order-medicines": { href: (item) => `/account/prescriptions#rx-${item.id}`, icon: ClipboardList },
  "follow-up": { href: () => "/doctors", icon: Stethoscope },
};

/**
 * The first screen of the account (GET /api/me/overview): what needs the
 * customer, the latest orders, and the way to everything else.
 */
export default function AccountOverviewPage() {
  const { user } = useAuth();
  const { state, reload } = useAsyncData(loadOverview);

  const tiles = [
    { href: "/account/consultations", icon: CalendarClock, title: "Consultations", value: state.status === "ready" ? state.data.counts.upcoming : null, unit: "upcoming" },
    { href: "/account/orders", icon: Package, title: "Orders", value: state.status === "ready" ? state.data.counts.ordersOnTheWay : null, unit: "on the way" },
    { href: "/account/prescriptions", icon: ClipboardList, title: "Prescriptions", value: state.status === "ready" ? state.data.counts.prescriptions : null, unit: "issued" },
    { href: "/account/addresses", icon: MapPin, title: "Addresses", value: state.status === "ready" ? state.data.counts.addresses : null, unit: "saved" },
  ];

  return (
    <div className="space-y-8">
      <section aria-labelledby="welcome" className={cn(panelClass, "flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8")}>
        <div>
          <h2 id="welcome" className="font-display text-2xl text-ink sm:text-[1.75rem]">
            Welcome back, {displayName(user)}
          </h2>
          <p className="mt-1 text-sm text-muted-ink">
            Signed in as +91 {user?.phone}
            {user?.email ? ` · ${user.email}` : ""}
          </p>
        </div>
        <Link
          href="/account/profile"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-forest/40 hover:text-forest focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:outline-none"
        >
          <Settings aria-hidden className="size-4" strokeWidth={1.7} />
          Edit profile
        </Link>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map(({ href, icon: Icon, title, value, unit }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                panelClass,
                "group flex h-full items-center gap-4 p-4 transition-[border-color,box-shadow] hover:border-forest/30 hover:shadow-soft focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:outline-none sm:flex-col sm:items-stretch sm:gap-0 sm:p-5",
              )}
            >
              {/* Phones: one compact row per tile. From sm: a card with the icon above. */}
              <span className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-full bg-sage-wash text-forest">
                  <Icon aria-hidden className="size-4.5" strokeWidth={1.7} />
                </span>
                <ArrowRight aria-hidden className="hidden size-4 text-muted-ink transition-transform group-hover:translate-x-0.5 group-hover:text-forest motion-reduce:transition-none sm:block" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col sm:flex-none">
                <span className="font-display text-lg text-ink sm:mt-4">{title}</span>
                <span className="mt-0.5 text-sm text-muted-ink">
                  {value === null ? <span className="inline-block h-4 w-20 rounded bg-cream-sunk motion-safe:animate-pulse" /> : `${value} ${unit}`}
                </span>
              </span>
              <ArrowRight aria-hidden className="size-4 text-muted-ink sm:hidden" />
            </Link>
          </li>
        ))}
      </ul>

      {state.status === "loading" ? <AccountLoading rows={2} label="Loading your account…" /> : null}
      {state.status === "error" ? <AccountError message={state.message} onRetry={reload} /> : null}

      {state.status === "ready" ? (
        <>
          {state.data.toDo.some((t) => t.kind in TODO) ? (
            <section aria-labelledby="todo" className="space-y-3">
              <h3 id="todo" className="font-display text-lg text-ink">Needs your attention</h3>
              {state.data.toDo
                .filter((t) => t.kind in TODO)
                .map((item) => {
                  const { href, icon: Icon } = TODO[item.kind];
                  return (
                  <Link
                    key={`${item.kind}-${item.id}`}
                    href={href(item)}
                    className="flex items-center gap-4 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm transition-colors hover:bg-amber-100/70 focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:outline-none"
                  >
                    <Icon aria-hidden className="size-5 shrink-0 text-amber-800" />
                    <span className="flex-1">
                      <span className="block font-semibold text-ink">{item.title}</span>
                      <span className="text-muted-ink">{item.detail}</span>
                    </span>
                    {item.amount !== null ? <span className="font-semibold text-ink tabular-nums">{formatRupees(item.amount)}</span> : null}
                  </Link>
                  );
                })}
            </section>
          ) : null}

          <section aria-labelledby="recent-orders" className={cn(panelClass, "p-6 sm:p-7")}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 id="recent-orders" className="font-display text-lg text-ink">Recent orders</h3>
              {state.data.orders.length ? (
                <Link href="/account/orders" className="text-sm font-semibold text-forest underline-offset-4 hover:underline">
                  View all
                </Link>
              ) : null}
            </div>
            {state.data.orders.length === 0 ? (
              <p className="text-sm text-muted-ink">
                You haven&rsquo;t placed an order yet.{" "}
                <Link href="/products" className="font-semibold text-forest underline-offset-4 hover:underline">
                  Browse remedies
                </Link>
              </p>
            ) : (
              <ul className="divide-y divide-line/70">
                {state.data.orders.map((order) => {
                  const status = orderStatus(order.status);
                  return (
                    <li key={order.id}>
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="-mx-2 flex items-center gap-4 rounded-xl px-2 py-3.5 transition-colors hover:bg-cream focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:outline-none"
                      >
                        <ProductThumb imageUrl={order.firstItem?.imageUrl ?? null} name={order.firstItem?.productName ?? order.orderNumber} className="size-12" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-ink">
                            {order.firstItem?.productName ?? `Order ${order.orderNumber}`}
                            {order.itemCount > 1 ? ` + ${order.itemCount - 1} more` : ""}
                          </span>
                          <span className="text-xs text-muted-ink">
                            {order.orderNumber} · {formatDate(order.placedAt)}
                          </span>
                        </span>
                        <span className="flex flex-col items-end gap-1">
                          <span className="text-sm font-semibold text-ink tabular-nums">{formatRupees(order.grandTotal)}</span>
                          <StatusPill {...status} />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
