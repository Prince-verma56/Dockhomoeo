import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/lib/repositories";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? undefined;
    const items = await repositories.care.listDoctors(q);
    return NextResponse.json({ items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load doctors";
    return NextResponse.json({ message }, { status: 500 });
  }
}
