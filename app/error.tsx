"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";

/**
 * A page whose data could not be loaded (most often: the shop server is not
 * responding). Shown inside the normal site chrome, never as "no results".
 * `retry()` fetches the page again, so it recovers as soon as the shop is back.
 */
export default function RouteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error("Route rendering failed", error);
  }, [error]);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-canvas">
        <Container className="grid min-h-[70vh] place-items-center dh-page-top dh-section-b text-center">
          <div role="alert" className="max-w-md">
            <span aria-hidden className="mx-auto grid size-14 place-items-center rounded-full bg-sage-tint text-forest">
              <AlertCircle className="size-6" strokeWidth={1.6} />
            </span>
            <h1 className="dh-title-section mt-6 text-ink">We couldn&rsquo;t load this page</h1>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-ink">
              The DocHomoeo shop isn&rsquo;t responding right now. This is usually temporary; please try again in a moment.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button type="button" variant="brand" size="xl" onClick={() => retry()}>
                <RotateCcw aria-hidden />
                Try again
              </Button>
              <Button asChild variant="brandOutline" size="xl">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
