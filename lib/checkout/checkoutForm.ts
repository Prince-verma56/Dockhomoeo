import type { ApiCheckoutAddress } from "@/types/api/cart";

/**
 * The checkout form and its rules. Limits and messages follow the backend's
 * addressSchema (shop.routes.ts), so a form that passes here is not refused
 * by the server for its shape; the server still checks everything again.
 */

/** India's 28 states and 8 union territories. */
export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
] as const;

export type CheckoutForm = {
  fullName: string;
  phone: string;
  line1: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  note: string;
  saveAddress: boolean;
};

export type CheckoutField = keyof Omit<CheckoutForm, "saveAddress">;
export type FieldErrors = Partial<Record<CheckoutField, string>>;

/** Field order on the page, so the first error is the first one a reader meets. */
export const FIELD_ORDER: CheckoutField[] = ["fullName", "phone", "pincode", "line1", "landmark", "city", "state", "note"];

export const EMPTY_FORM: CheckoutForm = {
  fullName: "",
  phone: "",
  line1: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  note: "",
  saveAddress: true,
};

/** "+91 98765 43210", "098765 43210" → "9876543210". Anything else is left for validation to reject. */
export function normalisePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function validateCheckoutForm(form: CheckoutForm): FieldErrors {
  const errors: FieldErrors = {};
  const length = (value: string) => value.trim().length;

  if (length(form.fullName) < 2) errors.fullName = "Enter the name for delivery";
  else if (length(form.fullName) > 120) errors.fullName = "Keep the name under 120 characters";

  if (!/^[6-9]\d{9}$/.test(normalisePhone(form.phone))) errors.phone = "Enter a 10-digit mobile number";

  if (length(form.line1) < 5) errors.line1 = "Enter the house number and street";
  else if (length(form.line1) > 300) errors.line1 = "Keep the address under 300 characters";

  if (length(form.landmark) > 120) errors.landmark = "Keep the landmark under 120 characters";

  if (length(form.city) < 2) errors.city = "Enter the city";
  else if (length(form.city) > 80) errors.city = "Keep the city under 80 characters";

  if (!INDIAN_STATES.includes(form.state as (typeof INDIAN_STATES)[number])) errors.state = "Choose the state";

  if (!/^\d{6}$/.test(form.pincode.trim())) errors.pincode = "A pincode has 6 digits";

  if (length(form.note) > 500) errors.note = "Keep the note under 500 characters";

  return errors;
}

export function toApiAddress(form: CheckoutForm): ApiCheckoutAddress {
  return {
    fullName: form.fullName.trim(),
    phone: normalisePhone(form.phone),
    line1: form.line1.trim(),
    landmark: form.landmark.trim() || null,
    city: form.city.trim(),
    state: form.state,
    pincode: form.pincode.trim(),
  };
}

/**
 * A refusal from the checkout boundary, in words fit to show the customer.
 * The API adapter maps HTTP errors to this; the development mock throws it
 * for the same reasons the backend would.
 */
export class CheckoutError extends Error {
  constructor(
    message: string,
    /** HTTP-like: 400 bad input, 401 signed out, 409 cart changed, 501 not connected, 5xx failure. */
    public readonly status: number,
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}
