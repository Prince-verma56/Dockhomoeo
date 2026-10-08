export interface ApiQuoteLineInput {
  variantId: number;
  quantity: number;
}

export interface ApiQuoteInput {
  lines: ApiQuoteLineInput[];
  couponCode?: string;
  paymentMethod?: "COD" | "ONLINE" | "CREDIT";
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

export interface ApiAddress {
  fullName: string;
  phone: string;
  line1: string;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
}

export interface ApiCheckoutPayload extends ApiQuoteInput {
  address: ApiAddress;
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
