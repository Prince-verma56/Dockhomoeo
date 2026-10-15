"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";

/** Handles a failed live catalogue request without presenting it as no results. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route rendering failed", error);
  }, [error]);

  return (
    <main className="grid min-h-[60vh] place-items-center bg-ivory px-5 py-20 text-center">
      <div className="max-w-md">
        <AlertCircle aria-hidden className="mx-auto size-8 text-forest" strokeWidth={1.6} />
        <h1 className="mt-4 font-display text-3xl text-ink">We could not load this page</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-ink">
          Please check your connection and try again. This is different from a catalogue search with no matching products.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={reset} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-forest px-4 text-sm font-semibold text-white transition-colors hover:bg-forest-deep">
            <RotateCcw aria-hidden className="size-4" />
            Try again
          </button>
          <Link href="/products" className="inline-flex min-h-10 items-center rounded-full border border-line bg-cream px-4 text-sm font-semibold text-ink transition-colors hover:border-forest/35 hover:text-forest">
            Browse products
          </Link>
        </div>
      </div>
    </main>
  );
}
