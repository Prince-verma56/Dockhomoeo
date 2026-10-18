import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") ?? "";
    const panel = request.headers.get("x-panel");

    // Attempt to proxy to the backend service if running
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const backendRes = await fetch(`${API_URL}/api/auth/session`, {
      headers: {
        cookie,
        ...(panel ? { "x-panel": panel } : {}),
      },
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (backendRes && backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }

    if (backendRes && backendRes.status === 401) {
      return NextResponse.json({ message: "Please sign in" }, { status: 401 });
    }

    // Backend is offline or unauthenticated; return 401 cleanly without proxy error
    return NextResponse.json({ message: "Please sign in" }, { status: 401 });
  } catch {
    return NextResponse.json({ message: "Please sign in" }, { status: 401 });
  }
}
