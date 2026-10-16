import { INDIAN_STATES, normalisePhone } from "@/lib/checkout/checkoutForm";
import type { ApiAddress, ApiAddressInput } from "@/types/api/account";

/** The backend keeps at most this many per customer (patient-panel.routes.ts). */
export const MAX_ADDRESSES = 10;

export type AddressForm = {
  fullName: string;
  phone: string;
  line1: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export type AddressField = keyof Omit<AddressForm, "isDefault">;
export type AddressErrors = Partial<Record<AddressField | "form", string>>;

export const ADDRESS_FIELD_ORDER: AddressField[] = ["fullName", "phone", "pincode", "line1", "landmark", "city", "state"];

export const emptyAddressForm = (defaults: Partial<AddressForm> = {}): AddressForm => ({
  fullName: "",
  phone: "",
  line1: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
  ...defaults,
});

export const addressToForm = (address: ApiAddress): AddressForm => ({
  fullName: address.fullName,
  phone: address.phone,
  line1: address.line1,
  landmark: address.landmark ?? "",
  city: address.city,
  state: address.state,
  pincode: address.pincode,
  isDefault: address.isDefault,
});

/** Same limits and words as the backend's addressInput, so a form that passes here is not refused for its shape. */
export function validateAddress(form: AddressForm): AddressErrors {
  const errors: AddressErrors = {};
  const length = (value: string) => value.trim().length;

  if (length(form.fullName) < 2) errors.fullName = "Enter the name for delivery.";
  else if (length(form.fullName) > 120) errors.fullName = "Keep the name under 120 characters.";
  if (!/^[6-9]\d{9}$/.test(normalisePhone(form.phone))) errors.phone = "Enter a 10-digit mobile number.";
  if (!/^\d{6}$/.test(form.pincode.trim())) errors.pincode = "A pincode has 6 digits.";
  if (length(form.line1) < 5) errors.line1 = "Enter the house number and street.";
  else if (length(form.line1) > 300) errors.line1 = "Keep the address under 300 characters.";
  if (length(form.landmark) > 120) errors.landmark = "Keep the landmark under 120 characters.";
  if (length(form.city) < 2) errors.city = "Enter the city.";
  else if (length(form.city) > 80) errors.city = "Keep the city under 80 characters.";
  if (!INDIAN_STATES.includes(form.state as (typeof INDIAN_STATES)[number])) errors.state = "Choose the state.";
  return errors;
}

export const toAddressInput = (form: AddressForm): ApiAddressInput => ({
  fullName: form.fullName.trim(),
  phone: normalisePhone(form.phone),
  line1: form.line1.trim(),
  landmark: form.landmark.trim() || null,
  city: form.city.trim(),
  state: form.state,
  pincode: form.pincode.trim(),
  isDefault: form.isDefault,
});
