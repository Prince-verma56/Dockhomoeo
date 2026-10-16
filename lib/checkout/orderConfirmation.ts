import type { ApiOrderDetail } from "@/types/api/cart";

/**
 * What /thankyou shows, derived only from an order the shop returned
 * (GET /api/me/orders/:id). Nothing here is assumed: no order, no confirmation.
 */
export type OrderConfirmation = {
  orderId: number;
  orderNumber: string;
  /** A development preview: nothing was placed or charged. */
  preview: boolean;
  state: "confirmed" | "awaiting-payment" | "cancelled" | "received";
  placedAt: string;
  payment: { method: ApiOrderDetail["paymentMethod"]; label: string; paid: boolean };
  /** Only enough to recognise the delivery — no street address or phone on screen. */
  deliverTo: { name: string; place: string };
  items: ApiOrderDetail["items"];
  totals: { subtotal: number; couponCode: string | null; couponDiscount: number; shipping: number; codCharge: number; total: number };
  /** The shop will open a payment page for it again (online, unpaid, gateway connected). */
  canPay: boolean;
};

const PAYMENT_LABELS: Record<ApiOrderDetail["paymentMethod"], string> = {
  COD: "Pay on delivery",
  ONLINE: "Paid online",
  CREDIT: "Wholesale credit",
  BANK_TRANSFER: "Bank transfer",
};

export function toOrderConfirmation(order: ApiOrderDetail, preview: boolean): OrderConfirmation {
  const paid = order.paymentStatus === "PAID";
  const state =
    order.status === "CANCELLED"
      ? "cancelled"
      : order.paymentMethod === "ONLINE" && !paid
        ? "awaiting-payment"
        : order.status === "CONFIRMED" || order.status === "PROCESSING" || order.status === "PACKED"
          ? "confirmed"
          : "received";
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    preview,
    state,
    placedAt: order.placedAt,
    payment: {
      method: order.paymentMethod,
      label: order.paymentMethod === "ONLINE" && !paid ? "Online payment pending" : PAYMENT_LABELS[order.paymentMethod],
      paid,
    },
    deliverTo: {
      name: order.customerName,
      place: [order.shippingCity, order.shippingState, order.shippingPincode].filter(Boolean).join(", "),
    },
    items: order.items,
    totals: {
      subtotal: order.subtotal,
      couponCode: order.couponCode,
      couponDiscount: order.couponDiscount,
      shipping: order.shippingCharge,
      codCharge: order.codCharge,
      total: order.grandTotal,
    },
    canPay: order.canPay,
  };
}
