"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, RotateCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/components/providers/CartProvider";
import { repositories } from "@/lib/repositories";
import { formatDate } from "@/lib/utils";
import type { ApiPrescription } from "@/types/api/prescription";

/**
 * Links the order to one of the customer's prescriptions. The backend's
 * checkout takes an optional `prescriptionId` and accepts it only for an
 * ISSUED prescription of the signed-in customer — exactly the ones
 * GET /api/me/prescriptions returns — so the choice is limited to that list.
 * Linking only records the prescription on the order; the cart is unchanged
 * (the prescriptions page is where prescribed medicines are added).
 *
 * Optional, like saved addresses: if the list cannot be read the checkout
 * still works, and the customer can try again.
 */
export function CheckoutPrescription({ userId }: { userId: number | null }) {
  const cart = useCart();
  const [loaded, setLoaded] = useState<{ userId: number; items: ApiPrescription[] | null } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (userId === null) return;
    let active = true;
    repositories.prescription.getPrescriptions().then(
      (items) => active && setLoaded({ userId, items }),
      () => active && setLoaded({ userId, items: null }),
    );
    return () => {
      active = false;
    };
  }, [userId, attempt]);

  const items = loaded && loaded.userId === userId ? loaded.items : undefined;
  const linked = cart.prescription;
  const { setPrescription } = cart;

  // A link kept from earlier (another account, or a prescription no longer
  // issued) would be refused at checkout: drop it once the list says so.
  const stale = Boolean(linked && items && !items.some((rx) => rx.id === linked.id));
  useEffect(() => {
    if (stale) setPrescription(null);
  }, [stale, setPrescription]);

  if (linked && !stale) {
    return (
      <p role="note" className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-forest/20 bg-forest/6 px-4 py-3 text-sm text-ink">
        <ClipboardList aria-hidden className="size-4 shrink-0 text-forest" />
        <span>
          Ordering for prescription <strong className="font-semibold">{linked.number}</strong>. It will be recorded on your order.
        </span>
        <button
          type="button"
          onClick={() => setPrescription(null)}
          className="ml-auto cursor-pointer rounded-sm font-semibold text-forest underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:outline-none"
        >
          Don&rsquo;t link it
        </button>
      </p>
    );
  }

  if (userId === null || items === undefined) return null;

  if (items === null) {
    return (
      <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-ink">
        <ClipboardList aria-hidden className="size-4 shrink-0 text-forest" />
        We couldn&rsquo;t load your prescriptions, so this order can&rsquo;t be linked to one right now.
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          className="inline-flex cursor-pointer items-center gap-1 rounded-sm font-semibold text-forest underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:outline-none"
        >
          <RotateCw aria-hidden className="size-3.5" />
          Try again
        </button>
      </p>
    );
  }

  // Nothing to link: no prescription is mentioned at all.
  if (items.length === 0) return null;

  return (
    <div className="mt-5 flex flex-col gap-3 rounded-xl border border-line/70 bg-paper px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5 text-sm">
        <ClipboardList aria-hidden className="mt-0.5 size-4 shrink-0 text-forest" />
        <div>
          <p id="checkout-rx-label" className="font-medium text-ink">
            Ordering for a prescription?
          </p>
          <p className="text-muted-ink">
            Link it to record it on this order. To add the prescribed medicines, use{" "}
            <Link href="/account/prescriptions" className="font-medium text-forest underline-offset-4 hover:underline">
              your prescriptions
            </Link>
            .
          </p>
        </div>
      </div>
      <Select
        onValueChange={(value) => {
          const rx = items.find((p) => String(p.id) === value);
          if (rx) setPrescription({ id: rx.id, number: rx.prescriptionNumber });
        }}
      >
        <SelectTrigger aria-labelledby="checkout-rx-label" className="h-11 w-full rounded-xl bg-cream sm:w-72">
          <SelectValue placeholder="Choose a prescription" />
        </SelectTrigger>
        <SelectContent>
          {items.map((rx) => (
            <SelectItem key={rx.id} value={String(rx.id)}>
              {rx.prescriptionNumber} · {rx.doctor.displayName} · {formatDate(rx.issuedAt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
