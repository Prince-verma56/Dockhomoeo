import { Section } from "@/components/shared/Section";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { Separator } from "@/components/ui/separator";
import { ICONS } from "@/lib/icons";
import { trustBenefits } from "@/data/mock/home";

/**
 * The trust strip.
 *
 * Intentionally the quietest band on the page: one rule-bounded row, no cards,
 * no shadows. It reinforces what the sections around it already said, so it
 * should register without competing (brain/08_UI_SPEC.md).
 */
export function WhyChoose() {
  return (
    <Section space="none" labelledBy="why-heading" className="py-10 md:py-12">
      <Container width="wide">
        <Reveal
          stagger="[data-benefit]"
          className="flex flex-col gap-6 rounded-card border border-line/70 bg-cream px-6 py-6 md:flex-row md:items-center md:gap-8 md:px-9"
        >
          <h2
            id="why-heading"
            data-benefit
            className="shrink-0 font-display text-[1.3125rem] text-ink"
          >
            Why Choose DocHomeo?
          </h2>

          <Separator
            orientation="vertical"
            aria-hidden
            className="hidden h-10 bg-line md:block"
          />

          <ul className="grid flex-1 grid-cols-2 gap-x-6 gap-y-5 md:flex md:items-center md:justify-between md:gap-4">
            {trustBenefits.map((benefit) => {
              const Icon = ICONS[benefit.icon];
              return (
                <li
                  key={benefit.id}
                  data-benefit
                  className="flex items-center gap-3"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sage-tint text-forest">
                    <Icon aria-hidden className="size-[18px]" strokeWidth={1.5} />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[0.8125rem] font-medium text-ink">
                      {benefit.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-ink">
                      {benefit.detail}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
