export interface ApiQuoteLineInput {
  variantId: number;
  quantity: number;
}

/** How an order is paid (backend quoteSchema). CREDIT is for approved wholesale accounts only. */
export type ApiPaymentMethod = "COD" | "ONLINE" | "CREDIT";

export interface ApiQuoteInput {
  lines: ApiQuoteLineInput[];
  couponCode?: string;
  paymentMethod?: ApiPaymentMethod;
}

export interface ApiQuoteLine {
  variantId: number;
  productId: number;
  productName: string;
  slug: string;
  variantTitle: string;
  sku: string;
  brandName: string | null;
  imageUrl: string | null;
  gstPercent: number;
  quantity: number;
  mrp: number;
  retailPrice: number;
  unitPrice: number;
  lineTotal: number;
  priceNote: string | null;
  minQuantity: number;
  maxQuantity: number;
  problem: string | null;
}

export interface ApiQuote {
  channel: "D2C" | "B2B";
  accountId: number | null;
  lines: ApiQuoteLine[];
  removed: number[];
  itemCount: number;
  mrpTotal: number;
  subtotal: number;
  savings: number;
  coupon: {
    id: number;
    code: string;
    discount: number;
    description: string | null;
  } | null;
  couponError: string | null;
  shippingCharge: number;
  freeDeliveryFrom: number | null;
  codAvailable: boolean;
  codCharge: number;
  grandTotal: number;
  wholesale: {
    businessName: string;
    tier: string | null;
    creditLimit: number;
    creditDays: number | null;
  } | null;
  onlinePayment: boolean;
  onlineTest: boolean;
}

/** The delivery address sent with an order (backend addressSchema). Not a saved address: see ApiAddress in ./account. */
export interface ApiCheckoutAddress {
  fullName: string;
  phone: string;
  line1: string;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
}

export interface ApiCheckoutPayload extends ApiQuoteInput {
  address: ApiCheckoutAddress;
  saveAddress?: boolean;
  note?: string | null;
  expectedTotal?: number;
  prescriptionId?: number;
}

export interface ApiCheckoutResponse {
  id: number;
  orderNumber: string;
  total: number;
  paid: boolean;
  payUrl: string | null;
}

/** GET /api/me/orders/:id — one of the signed-in customer's orders. */
export interface ApiOrderDetail {
  id: number;
  orderNumber: string;
  channel: "D2C" | "B2B";
  status: string;
  paymentMethod: ApiPaymentMethod;
  paymentStatus: string;
  placedAt: string;
  estimatedDelivery: string | null;
  subtotal: number;
  couponCode: string | null;
  couponDiscount: number;
  shippingCharge: number;
  codCharge: number;
  grandTotal: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  items: {
    id: number;
    productName: string;
    variantTitle: string;
    brandName: string | null;
    imageUrl: string | null;
    quantity: number;
    mrp: number | null;
    unitPrice: number;
    lineTotal: number;
    slug: string | null;
  }[];
  canCancel: boolean;
  canPay: boolean;
}
