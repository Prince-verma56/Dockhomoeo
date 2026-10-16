import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";

/** Shown while the doctor directory is loaded from the backend. */
export default function DoctorsLoading() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-canvas overflow-x-hidden" aria-busy="true">
        <p role="status" className="sr-only">
          Loading doctors…
        </p>
        <section className="dh-head-arc dh-page-top pb-8 sm:pb-12 lg:pb-16">
          <Container width="wide">
            <div className="mb-6 h-5 w-28 rounded bg-cream-sunk/60 motion-safe:animate-pulse" />
            <div aria-hidden className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12 xl:gap-16">
              <div className="space-y-4 lg:col-span-7">
                <div className="h-6 w-44 rounded-full bg-cream-sunk motion-safe:animate-pulse" />
                <div className="h-12 w-full max-w-lg rounded-xl bg-cream-sunk motion-safe:animate-pulse" />
                <div className="h-5 w-full max-w-md rounded bg-cream-sunk motion-safe:animate-pulse" />
                <div className="mt-6 flex gap-3">
                  <div className="h-11 w-36 rounded-full bg-cream-sunk motion-safe:animate-pulse" />
                  <div className="h-11 w-32 rounded-full bg-cream-sunk/70 motion-safe:animate-pulse" />
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3.5] rounded-[2rem] bg-cream-sunk/70 motion-safe:animate-pulse" />
              </div>
            </div>
          </Container>
        </section>
        <section className="dh-section-b pt-4 pb-12 sm:pb-16">
          <Container width="wide">
            <ul aria-hidden className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <li key={i} className="h-80 rounded-[1.75rem] border border-line/60 bg-paper motion-safe:animate-pulse" />
              ))}
            </ul>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
