# DocHomo Frontend-Backend Handoff

This document describes the structure and flow of the DocHomo frontend commerce integration. 
The current implementation runs entirely in the browser using local repository abstractions and mock data.
When the backend API is ready, the backend developer simply needs to implement the `IHomeRepository`, `ISearchRepository`, `IProductRepository`, and `ICartRepository` interfaces (defined in `lib/repositories/interfaces.ts`) and swap them into the Dependency Injection container (`lib/repositories/index.ts`).

No presentation components (UI) will need to be rewritten.

---

## 1. Cart & Quote Integration

### Quote Request
The frontend `CartProvider` tracks an array of `items` and a `couponCode`.
Whenever these change, it requests a fresh `ApiQuote` from the repository:

**Input (`ApiQuoteLineInput`):**
```typescript
{
  variantId: number;
  quantity: number;
}
```

**Quote Method:**
```typescript
getQuote(lines: ApiQuoteLineInput[], couponCode?: string): Promise<ApiQuote>
```

### Quote Response (`ApiQuote`)
The frontend explicitly expects the quote response to provide structured line items and final calculations:
- `subtotal`: The sum of all item prices * quantities (before discounts/shipping).
- `savings`: Any coupon or promotion savings applied.
- `shippingCharge`: Cost of shipping (use `0` to display "Free").
- `codCharge`: Extra charge if Cash on Delivery is selected (handled in Quote/Checkout).
- `grandTotal`: The final amount the user will pay.

**Important Note:** 
The frontend does **NOT** calculate total prices. The backend is the single source of truth for all math. The UI merely renders `quote.subtotal`, `quote.shippingCharge`, and `quote.grandTotal`.

---

## 2. Checkout & Order Flow

When the user submits the checkout form on `/checkout`, the frontend sends an `ApiCheckoutPayload`.

### Checkout Payload
```typescript
interface ApiCheckoutPayload {
  // Same as Quote Input
  lines: ApiQuoteLineInput[];
  couponCode?: string;
  paymentMethod?: "COD" | "ONLINE" | "CREDIT";

  // Address
  address: {
    fullName: string;
    phone: string;
    line1: string;
    landmark?: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  saveAddress?: boolean;

  // Extra Details
  note?: string | null;
  expectedTotal?: number; // Frontend calculated total for backend verification
  prescriptionId?: number; // Included if a prescription was attached
}
```

### Checkout Response (`ApiCheckoutResponse`)
The repository should process the order and return the result:
```typescript
interface ApiCheckoutResponse {
  id: number;
  orderNumber: string; // E.g., "ORD-123456"
  total: number;
  paid: boolean;
  payUrl: string | null; // If ONLINE payment, return Razorpay/Stripe URL here
}
```

- If `payUrl` is present, the frontend can redirect the user to complete payment.
- If `paid: true` or `paymentMethod === 'COD'`, the frontend clears the cart and navigates directly to `/checkout/success?orderNumber=XXX`.

---

## 3. Implementation Details for Backend Devs

- **No Hardcoded Logic**: Do not assume the frontend handles taxes, shipping thresholds, or coupon validation logic. If a coupon is invalid, return `couponError` in the `ApiQuote` response.
- **Repository Pattern**: Look at `lib/repositories/local.ts` to see exactly how the mock data responds. Build your `ApiCartRepository` (e.g. `lib/repositories/api.ts`) to return identical structures using `fetch()`.
- **Product Variants**: The frontend cart relies entirely on `variantId`. Products without variants should still have at least one default variant in the backend database.
