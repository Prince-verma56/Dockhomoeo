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
    <div className="border-t border-line bg-cream-sunk py-4">
      <Container>
        <p className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-ink">
          <Info aria-hidden className="mt-px size-4 shrink-0" strokeWidth={1.6} />
          <span>
            <strong className="font-medium text-ink">Demo content.</strong>{" "}
            Products, brands, prices, ratings, doctors, availability and patient
            quotes on this page are placeholder data for design review, not real
            listings or medical advice.
          </span>
        </p>
      </Container>
    </div>
  );
}
