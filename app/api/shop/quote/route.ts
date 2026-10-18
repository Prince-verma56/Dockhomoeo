import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/lib/repositories";
import type { ApiQuoteLineInput, ApiPaymentMethod } from "@/types/api/cart";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      lines?: ApiQuoteLineInput[];
      couponCode?: string;
      paymentMethod?: ApiPaymentMethod;
    };

    const lines = body.lines ?? [];
    const couponCode = body.couponCode?.trim() || undefined;
    const paymentMethod = body.paymentMethod ?? "COD";

    const quote = await repositories.cart.getQuote(lines, couponCode, paymentMethod);
    return NextResponse.json(quote);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to calculate quote";
    return NextResponse.json({ message }, { status: 400 });
  }
}
