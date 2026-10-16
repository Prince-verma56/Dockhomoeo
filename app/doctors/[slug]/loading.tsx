import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";

/** Shown while a doctor's profile and the day's free times are read from the shop. */
export default function DoctorLoading() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-canvas" aria-busy="true">
        <p role="status" className="sr-only">
          Loading the doctor’s profile…
        </p>
        <section className="dh-head-arc dh-page-top">
          <Container width="wide">
            <div aria-hidden className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="size-24 shrink-0 rounded-full bg-cream-sunk motion-safe:animate-pulse" />
              <div className="space-y-3">
                <div className="h-10 w-72 max-w-full rounded-lg bg-cream-sunk motion-safe:animate-pulse" />
                <div className="h-4 w-48 rounded bg-cream-sunk motion-safe:animate-pulse" />
              </div>
            </div>
          </Container>
        </section>
        <Container width="wide" className="dh-section-b">
          <div aria-hidden className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="h-80 rounded-[1.5rem] border border-line/60 bg-paper motion-safe:animate-pulse" />
            <div className="h-56 rounded-[1.5rem] border border-line/60 bg-paper motion-safe:animate-pulse" />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
