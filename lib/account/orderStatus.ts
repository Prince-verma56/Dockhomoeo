import type { ApiOrderStatus } from "@/types/api/account";

export type StatusTone = "neutral" | "progress" | "success" | "warning" | "danger";

/** Every backend order status (prisma `OrderStatus`) in the customer's words. */
const ORDER_STATUS: Record<ApiOrderStatus, { label: string; tone: StatusTone }> = {
  PENDING: { label: "Awaiting payment", tone: "warning" },
  CONFIRMED: { label: "Confirmed", tone: "progress" },
  PROCESSING: { label: "Being prepared", tone: "progress" },
  PACKED: { label: "Packed", tone: "progress" },
  SHIPPED: { label: "Shipped", tone: "progress" },
  OUT_FOR_DELIVERY: { label: "Out for delivery", tone: "progress" },
  DELIVERED: { label: "Delivered", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
  UNDELIVERED: { label: "Not delivered", tone: "danger" },
  RETURN_REQUESTED: { label: "Return requested", tone: "warning" },
  RETURNED: { label: "Returned", tone: "neutral" },
  REFUNDED: { label: "Refunded", tone: "neutral" },
};

const humanise = (value: string) => value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ");

export function orderStatus(status: string): { label: string; tone: StatusTone } {
  return ORDER_STATUS[status as ApiOrderStatus] ?? { label: humanise(status), tone: "neutral" };
}

const PAYMENT_STATUS: Record<string, string> = {
  PENDING: "Not paid yet",
  PAID: "Paid",
  PARTIALLY_PAID: "Partly paid",
  FAILED: "Payment failed",
  REFUNDED: "Refunded",
};

export const paymentStatusLabel = (status: string) => PAYMENT_STATUS[status] ?? humanise(status);

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: "Pay on delivery",
  ONLINE: "Online payment",
  CREDIT: "Wholesale credit",
  BANK_TRANSFER: "Bank transfer",
};

export const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "border-line bg-cream-sunk text-muted-ink",
  progress: "border-forest/20 bg-forest/8 text-forest-deep",
  success: "border-forest/30 bg-forest text-cream",
  warning: "border-amber-300/60 bg-amber-50 text-amber-800",
  danger: "border-destructive/25 bg-destructive/8 text-destructive",
};
