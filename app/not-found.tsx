import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * Unknown URLs and every `notFound()` — a product, brand or insight slug the
 * catalogue does not have — land here inside the normal site chrome, with the
 * ways back into the shop rather than a dead end.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-canvas">
        <Container className="grid min-h-[70vh] place-items-center dh-page-top dh-section-b text-center">
          <div className="max-w-md">
            <span aria-hidden className="mx-auto grid size-14 place-items-center rounded-full bg-sage-tint text-forest">
              <Compass className="size-6" strokeWidth={1.6} />
            </span>
            <p className="dh-eyebrow mt-6 text-muted-ink">Error 404</p>
            <h1 className="dh-title-section mt-3 text-ink">
              We couldn&rsquo;t find that page
            </h1>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-ink">
              The link may be out of date, or the product is no longer listed. Everything we stock is still a click away.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="brand" size="xl">
                <Link href="/products">
                  Shop all products
                  <ArrowRight aria-hidden className="size-4" strokeWidth={1.8} />
                </Link>
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
