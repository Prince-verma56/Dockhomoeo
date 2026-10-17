import { NextResponse } from "next/server";
import { repositories } from "@/lib/repositories";

export async function GET() {
  try {
    const data = await repositories.home.getHomeData();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load home data";
    return NextResponse.json({ message }, { status: 500 });
  }
}
