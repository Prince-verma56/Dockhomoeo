export interface ApiServiceabilityResult {
  isServiceable: boolean;
  message: string;
  pincode?: string;
  city?: string;
  state?: string;
  estimatedDeliveryDays?: number;
}