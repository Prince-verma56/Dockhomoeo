/** GET /api/shop/pincode/:pincode. Pincodes the shop has no record of count as deliverable. */
export interface ApiServiceabilityResult {
  pincode: string;
  deliverable: boolean;
  codAvailable: boolean;
  deliveryDays: number | null;
  city: string | null;
  state: string | null;
}
