import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/lib/repositories";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ pincode: string }> }
) {
  try {
    const { pincode } = await context.params;
    const res = await repositories.serviceability.checkPincode(pincode);
    return NextResponse.json(res);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to verify pincode";
    return NextResponse.json({ message }, { status: 500 });
  }
}
