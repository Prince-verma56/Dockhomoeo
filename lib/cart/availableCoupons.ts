export interface AvailableCoupon {
  code: string;
  title: string;
  description: string;
  discountType: "PERCENT" | "FLAT";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  tag?: string;
  expiryNote?: string;
}

export const AVAILABLE_COUPONS: AvailableCoupon[] = [
  {
    code: "HEALTH10",
    title: "10% OFF on Homoeopathic Remedies",
    description: "Get 10% instant discount on all genuine dilutions, mother tinctures & bio-chemic tablets.",
    discountType: "PERCENT",
    discountValue: 10,
    minOrderValue: 249,
    maxDiscount: 100,
    tag: "Most Popular",
    expiryNote: "Valid today",
  },
  {
    code: "DOCTOR15",
    title: "15% OFF Doctor Prescribed Care",
    description: "Special clinical discount on authentic German and Indian homoeopathic remedies.",
    discountType: "PERCENT",
    discountValue: 15,
    minOrderValue: 499,
    maxDiscount: 150,
    tag: "Doctor Special",
    expiryNote: "Limited time",
  },
  {
    code: "FIRST50",
    title: "Flat ₹50 OFF on First Order",
    description: "Welcome offer for first-time DocHomoeo patients. No heavy cart restrictions.",
    discountType: "FLAT",
    discountValue: 50,
    minOrderValue: 199,
    tag: "New Patient",
    expiryNote: "One-time use",
  },
  {
    code: "WELLNESS20",
    title: "20% OFF on Family Wellness Packs",
    description: "Extra 20% discount on orders above ₹899 for monthly refill packs and seasonal remedies.",
    discountType: "PERCENT",
    discountValue: 20,
    minOrderValue: 899,
    maxDiscount: 250,
    tag: "Super Saver",
    expiryNote: "Special deal",
  },
];

