import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/lib/repositories";
import type { ApiCheckoutPayload } from "@/types/api/cart";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json().catch(() => ({}))) as ApiCheckoutPayload;
    const res = await repositories.cart.checkout(payload);
    return NextResponse.json(res);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to place order";
    return NextResponse.json({ message }, { status: 400 });
  }
}
