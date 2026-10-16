"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarClock, ClipboardList, Info, ShoppingBag, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/CartProvider";
import { cartStore, getSnapshot } from "@/lib/cart/cartStore";
import type { ApiPrescription } from "@/types/api/prescription";
import { AccountEmpty, AccountError, AccountLoading, AccountPageHeader, StatusPill, panelClass } from "@/components/account/AccountStates";
import { repositories } from "@/lib/repositories";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { formatRupees } from "@/lib/formatters/price";
import { formatDate, cn } from "@/lib/utils";

const loadPrescriptions = () => repositories.prescription.getPrescriptions();

/**
 * Prescriptions a DocHomoeo doctor issued to this customer
 * (GET /api/me/prescriptions; only ISSUED ones are returned). The medicines
 * the shop sells can be ordered through the normal checkout with the
 * prescription's id. There is no upload: the backend only holds
 * prescriptions written by its own doctors.
 */
/** The prescribed medicines the shop sells and has in stock, as cart lines. */
const orderable = (rx: ApiPrescription) =>
  rx.items.flatMap((item) => (item.buy && item.buy.inStock ? [{ item, buy: item.buy }] : []));

export default function PrescriptionsPage() {
  const { state, reload } = useAsyncData(loadPrescriptions);
  const router = useRouter();
  const { setPrescription } = useCart();

  /**
   * Puts the prescribed packs in the cart (raising a line to the prescribed
   * quantity, never lowering what is already there) and continues to the
   * normal checkout, which sends `prescriptionId`. The shop re-prices and
   * checks stock there, as for any order.
   */
  const orderPrescription = (rx: ApiPrescription) => {
    const current = new Map(getSnapshot().items.map((line) => [line.variantId, line.quantity]));
    for (const { item, buy } of orderable(rx)) {
      const have = current.get(buy.variantId);
      if (have === undefined) {
        cartStore.add({ variantId: buy.variantId, quantity: item.quantity, title: buy.productName, price: buy.price, imageUrl: buy.imageUrl ?? undefined });
      } else if (have < item.quantity) {
        cartStore.setQuantity(buy.variantId, item.quantity);
      }
    }
    setPrescription({ id: rx.id, number: rx.prescriptionNumber });
    router.push("/checkout");
  };

  return (
    <div>
      <AccountPageHeader title="Prescriptions" description="Issued by DocHomoeo doctors after your consultations." />

      <p role="note" className="mb-6 flex items-start gap-2.5 rounded-xl border border-line-soft bg-paper px-4 py-3 text-sm text-muted-ink">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-forest" />
        <span>
          Only prescriptions written by a DocHomoeo doctor appear here, once issued. Uploading a prescription from another doctor is not
          available yet; to share one with a DocHomoeo doctor, attach it when you{" "}
          <Link href="/doctors" className="font-medium text-forest underline-offset-4 hover:underline">
            book a consultation
          </Link>
          .
        </span>
      </p>

      {state.status === "loading" ? <AccountLoading rows={2} label="Loading your prescriptions…" /> : null}
      {state.status === "error" ? <AccountError message={state.message} onRetry={reload} /> : null}

      {state.status === "ready" && state.data.length === 0 ? (
        <AccountEmpty
          icon={<ClipboardList aria-hidden className="size-6" strokeWidth={1.6} />}
          title="No prescriptions yet"
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="brand" size="xl">
                <Link href="/doctors">
                  <Stethoscope aria-hidden />
                  Find a doctor
                </Link>
              </Button>
              <Button asChild variant="brandOutline" size="xl">
                <Link href="/products">Shop remedies</Link>
              </Button>
            </div>
          }
        >
          After a consultation with a DocHomoeo doctor, the prescription they write appears here.
        </AccountEmpty>
      ) : null}

      {state.status === "ready" && state.data.length > 0 ? (
        <ul className="space-y-5">
          {state.data.map((rx) => (
            <li key={rx.id} id={`rx-${rx.id}`} className={cn(panelClass, "scroll-mt-28 p-5 sm:p-7")}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="flex items-center gap-2.5 text-xs font-semibold tracking-wider text-muted-ink uppercase">
                    {rx.prescriptionNumber}
                    {/* The backend returns issued prescriptions only. */}
                    <StatusPill label="Issued" tone="success" className="normal-case tracking-normal" />
                  </p>
                  <h3 className="mt-1 flex items-center gap-2 font-display text-lg text-ink">
                    <Stethoscope aria-hidden className="size-4.5 text-forest" strokeWidth={1.7} />
                    {rx.doctor.displayName}
                    {rx.doctor.qualification ? <span className="text-sm font-normal text-muted-ink">{rx.doctor.qualification}</span> : null}
                  </h3>
                  <p className="mt-1 text-sm text-muted-ink">
                    For {rx.patientName} · Issued {formatDate(rx.issuedAt)}
                  </p>
                </div>
                {rx.followUpDate ? (
                  <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sage-wash px-3 py-1 text-xs font-medium text-forest-deep">
                    <CalendarClock aria-hidden className="size-3.5" />
                    Follow up {formatDate(rx.followUpDate)}
                  </p>
                ) : null}
              </div>

              {rx.diagnosis ? (
                <p className="mt-4 text-sm text-ink">
                  <span className="font-medium">Diagnosis:</span> {rx.diagnosis}
                </p>
              ) : null}

              <ul className="mt-4 divide-y divide-line/70 rounded-xl border border-line/70">
                {rx.items.map((item) => (
                  <li key={item.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-ink">
                        {item.medicineName}
                        {item.potency ? ` ${item.potency}` : ""}
                      </p>
                      <p className="text-sm text-muted-ink">
                        {[item.dosage, item.frequency, item.duration].filter(Boolean).join(" · ") || "As directed"}
                        {item.instructions ? ` — ${item.instructions}` : ""}
                      </p>
                    </div>
                    <p className="text-sm text-muted-ink sm:text-right">
                      {item.buy
                        ? `${item.buy.productName} · ${formatRupees(item.buy.price)} · ${item.buy.inStock ? "In stock" : "Out of stock"}`
                        : "Not sold on DocHomoeo"}
                    </p>
                  </li>
                ))}
              </ul>

              {rx.advice ? <p className="mt-4 text-sm text-muted-ink">{rx.advice}</p> : null}

              <div className="mt-5 flex flex-col gap-3 border-t border-line/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-ink">
                  {orderable(rx).length === 0
                    ? "None of these medicines can be ordered here right now."
                    : orderable(rx).length === rx.items.length
                      ? "All prescribed medicines are available to order."
                      : `${orderable(rx).length} of ${rx.items.length} prescribed medicines are available to order.`}
                </p>
                {orderable(rx).length > 0 ? (
                  <Button variant="brand" size="xl" onClick={() => orderPrescription(rx)} className="w-full sm:w-auto">
                    <ShoppingBag aria-hidden />
                    Order available medicines
                  </Button>
                ) : null}
              </div>

              {rx.orders.length ? (
                <p className="mt-4 text-sm text-muted-ink">
                  Ordered:{" "}
                  {rx.orders.map((order, i) => (
                    <span key={order.id}>
                      {i > 0 ? ", " : null}
                      <Link href={`/account/orders/${order.id}`} className="font-medium text-forest underline-offset-4 hover:underline">
                        {order.orderNumber}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {state.status === "ready" && state.data.length > 0 ? (
        <nav aria-label="More" className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/account/consultations" className="inline-flex items-center gap-1.5 font-semibold text-forest underline-offset-4 hover:underline">
            Your consultations
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
          <Link href="/products" className="inline-flex items-center gap-1.5 font-semibold text-forest underline-offset-4 hover:underline">
            Continue shopping
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
