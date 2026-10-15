import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/Container";

/**
 * Shown when arriving from another route while results load. It draws the
 * same frame as SearchView, so nothing jumps when the products land.
 */
export default function SearchLoading() {
  return (
    <div role="status">
      <span className="sr-only">Loading search results…</span>

      <section className="border-b border-line/60 bg-canvas pt-24 pb-8 sm:pt-28 lg:pb-10">
        <Container>
          <Bone className="mb-5 h-5 w-28" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div>
              <Bone className="h-9 w-64 sm:h-11 sm:w-96" />
              <Bone className="mt-3 h-4 w-24" />
            </div>
            <Bone className="h-12 w-full rounded-xl lg:max-w-md" />
          </div>
        </Container>
      </section>

      <Container className="pt-8 pb-16 lg:py-10">
        <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 xl:gap-14">
          <div className="hidden space-y-4 lg:block">
            <Bone className="h-5 w-24" />
            {Array.from({ length: 7 }, (_, i) => (
              <Bone key={i} className="h-4 w-full" />
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i} className="overflow-hidden rounded-card border border-line/70 bg-cream">
                <Bone className="aspect-4/5 rounded-none" />
                <div className="space-y-2.5 border-t border-line/50 bg-white p-4">
                  <Bone className="h-3 w-16" />
                  <Bone className="h-4 w-4/5" />
                  <Bone className="h-3 w-1/2" />
                  <Bone className="mt-4 h-8 w-full" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </div>
  );
}

function Bone({ className }: { className?: string }) {
  return <div aria-hidden className={cn("rounded-md bg-cream-sunk motion-safe:animate-pulse", className)} />;
}
