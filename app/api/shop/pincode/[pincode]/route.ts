import { NextRequest, NextResponse } from "next/server";
import { LocalServiceabilityRepository } from "@/lib/repositories/local";

const localServiceability = new LocalServiceabilityRepository();

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ pincode: string }> }
) {
  try {
    const { pincode } = await context.params;
    const res = await localServiceability.checkPincode(pincode);
    return NextResponse.json(res);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to verify pincode";
    return NextResponse.json({ message }, { status: 500 });
  }
}
