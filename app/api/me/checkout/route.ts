import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") ?? "";
    const panel = request.headers.get("x-panel");
    const body = await request.text();

    const backendRes = await fetch(`${API_URL}/api/me/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie,
        ...(panel ? { "x-panel": panel } : {}),
      },
      body,
    });

    const data = await backendRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to place order";
    return NextResponse.json({ message }, { status: 500 });
  }
}
