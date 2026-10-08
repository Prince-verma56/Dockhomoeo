export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface ApiAddress {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface ApiOrderLine {
  id: string;
  productId: number;
  productName: string;
  variantId: number;
  variantName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  placedAt: string;
  subtotal: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  items: ApiOrderLine[];
  shippingAddress: ApiAddress;
  paymentMethod: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
}

export interface ApiAccountProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
}

export interface ApiOrderSummary {
  id: number;
  orderNumber: string;
  status: string;
  grandTotal: number;
  placedAt: string | Date;
  itemCount: number;
}
