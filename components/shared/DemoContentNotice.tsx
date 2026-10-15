import { Info } from "lucide-react";
import { Container } from "@/components/shared/Container";

/**
 * States plainly that everything commercial on this page is placeholder data.
 *
 * brain/00_MASTER_RULES.md forbids presenting invented prices, ratings,
 * doctors, brands or reviews as real. The homepage needs populated commerce
 * sections to be designed at all, so the data exists — and this notice is what
 * keeps it honest while the page is in design review. Delete this component in
 * the same change that connects the real catalogue.
 */
export function DemoContentNotice() {
  return (
    <aside aria-label="Development catalogue notice" className="border-t border-line-soft bg-canvas py-2.5">
      <Container>
        <p className="flex items-center justify-center gap-2 text-center text-[0.75rem] leading-normal text-muted-ink/80">
          <Info aria-hidden className="size-3.5 shrink-0 opacity-70" strokeWidth={1.5} />
          <span>
            <span className="font-medium text-ink/90">Development catalogue:</span>{" "}
            Sample products, prices, and ratings are demonstration data for interface review.
          </span>
        </p>
      </Container>
    </aside>
  );
}
