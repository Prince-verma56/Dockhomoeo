import type { ApiGender } from "./auth";
import type { ApiPaymentMethod } from "./cart";

/**
 * The customer's account, as the backend serves it under /api/me
 * (shop.routes.ts, patient-panel.routes.ts, care.routes.ts). Ids are numbers.
 */

/** Every order status the backend uses (prisma `OrderStatus`). */
export type ApiOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "UNDELIVERED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "REFUNDED";

/**
 * Body of PATCH /api/me/profile. There is no GET: the session (GET /api/auth/session)
 * carries the same fields. `firstName` is required; empty strings clear the others.
 */
export interface ApiProfileInput {
  firstName: string;
  lastName: string;
  email: string;
  gender: ApiGender | "";
  dateOfBirth: string;
}

/** GET /api/me/addresses (up to 10, the default first). */
export interface ApiAddress {
  id: number;
  fullName: string;
  phone: string;
  line1: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

/** Body of POST /api/me/addresses and PATCH /api/me/addresses/:id. */
export interface ApiAddressInput {
  fullName: string;
  phone: string;
  line1: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

/** One row of GET /api/me/orders. */
export interface ApiOrderSummary {
  id: number;
  orderNumber: string;
  status: ApiOrderStatus;
  paymentMethod: ApiPaymentMethod | "BANK_TRANSFER";
  paymentStatus: string;
  grandTotal: number;
  placedAt: string;
  channel: "D2C" | "B2B";
  estimatedDelivery: string | null;
  prescription: { prescriptionNumber: string } | null;
  items: { productName: string; variantTitle: string; quantity: number; imageUrl: string | null }[];
  shipments: { carrier: string | null; trackingNumber: string | null; trackingUrl: string | null }[];
}

/** GET /api/me/overview, the parts the account overview shows. */
export interface ApiAccountOverview {
  counts: {
    upcoming: number;
    consultationsDone: number;
    prescriptions: number;
    ordersOnTheWay: number;
    addresses: number;
  };
  orders: {
    id: number;
    orderNumber: string;
    status: ApiOrderStatus;
    grandTotal: number;
    placedAt: string;
    estimatedDelivery: string | null;
    itemCount: number;
    firstItem: { productName: string; imageUrl: string | null } | null;
  }[];
  toDo: {
    kind: "pay-consultation" | "pay-order" | "order-medicines" | "follow-up" | "rate";
    id: number;
    title: string;
    detail: string;
    amount: number | null;
  }[];
}
