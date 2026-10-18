import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!message || message.length < 3) {
      return NextResponse.json(
        { ok: false, message: "Please provide at least a few words of feedback." },
        { status: 400 }
      );
    }

    const payload = {
      message,
      category: typeof body?.category === "string" ? body.category : "GENERAL",
      email: typeof body?.email === "string" ? body.email : undefined,
      pageUrl: typeof body?.pageUrl === "string" ? body.pageUrl : request.headers.get("referer") ?? undefined,
      metadata: {
        userAgent: request.headers.get("user-agent") ?? undefined,
        submittedAt: new Date().toISOString(),
      },
    };

    // Forward to backend API if running
    try {
      const backendUrl = process.env.API_URL ?? "http://localhost:4000";
      const res = await fetch(`${backendUrl}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3500),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend may be offline or in standalone frontend mode: gracefully confirm receipt
    }

    return NextResponse.json({
      ok: true,
      message: "Thank you for sharing your feedback with DocHomoeo!",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to submit feedback";
    return NextResponse.json({ ok: false, message: errorMsg }, { status: 500 });
  }
}
