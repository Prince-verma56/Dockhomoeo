import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/lib/repositories";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    const res = await repositories.search.suggest(q);
    return NextResponse.json(res);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch suggestions";
    return NextResponse.json({ message }, { status: 500 });
  }
}
