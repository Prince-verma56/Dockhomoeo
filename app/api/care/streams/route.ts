import { NextResponse } from "next/server";
import { repositories } from "@/lib/repositories";

export async function GET() {
  try {
    const items = await repositories.care.getStreams();
    return NextResponse.json({ items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load streams";
    return NextResponse.json({ message }, { status: 500 });
  }
}
