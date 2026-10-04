import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/Container";
import { SplitHeading } from "@/components/shared/SplitHeading";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { Reveal } from "@/components/shared/Reveal";
import { Parallax } from "@/components/shared/Parallax";
import { ProductStage } from "@/components/shared/ProductStage";
import { ProductGlyph } from "@/components/commerce/ProductGlyph";
import { ICONS } from "@/lib/icons";
import { offerCampaign } from "@/data/mock/home";

/**
 * The campaign banner — the page's one dark, cinematic band.
 *
 * Set as an inset block with a deep radius rather than a full-bleed strip, so
 * the ivory page reads as the paper it is printed on. That inset is also the
 * page's main organic transition into the footer, which is why there is no wave
 * separator anywhere above it (brain/11_ANIMATION_SPEC.md, pattern H).
 *
 * No percentage, price or deadline is rendered: the campaign object carries
 * copy only, and the real promotion arrives from the promotions source.
 */
export function OfferBanner() {
  return (
    <section
      aria-labelledby="offer-heading"
      className="bg-ivory px-3 pt-4 pb-8 sm:px-5 md:pt-8 md:pb-12"
    >
      <Container width="wide" className="px-0 sm:px-0 lg:px-0">
        <div className="dh-grain dh-grain-dark relative isolate overflow-hidden rounded-[2rem] bg-forest-deep md:rounded-[2.5rem]">
          {/* Single dramatic key light behind the product, warm trace at right. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(44% 56% at 62% 14%, rgba(201,226,208,0.2), transparent 70%), radial-gradient(40% 44% at 98% 96%, rgba(201,142,85,0.18), transparent 72%)",
            }}
          />

          <div className="relative grid items-center gap-10 px-6 py-12 sm:px-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)_minmax(0,0.58fr)] lg:gap-10 lg:px-14 lg:py-12 xl:px-20">
            {/* ------------------------------------------------------- copy */}
            <div className="max-w-[26rem]">
              <Reveal>
                <Eyebrow rule className="text-cream/70">
                  {offerCampaign.eyebrow}
                </Eyebrow>
              </Reveal>

              <SplitHeading
                id="offer-heading"
                lines={[...offerCampaign.headlineLines]}
                className="mt-5 text-[2.25rem] leading-[1.02] text-cream sm:text-[2.875rem] lg:text-[3.25rem]"
              />

              <Reveal delay={0.12}>
                <p className="mt-5 max-w-[36ch] text-[0.9375rem] leading-relaxed text-cream/70">
                  {offerCampaign.description}
                </p>

                <Button
                  asChild
                  variant="brandOnDark"
                  size="pill"
                  className="mt-8"
                >
                  <Link href={offerCampaign.ctaHref}>
                    {offerCampaign.ctaLabel}
                    <ArrowRight className="size-4" strokeWidth={1.8} />
                  </Link>
                </Button>
              </Reveal>
            </div>

            {/* ---------------------------------------------- product stage */}
            <div className="mx-auto w-full max-w-[16rem] sm:max-w-[18rem] lg:max-w-[17rem]">
              <Parallax speed={-9} minWidth={1024}>
                <ProductStage
                  label={offerCampaign.mediaLabel}
                  tone="dark"
                  ratio="aspect-[4/5]"
                >
                  <ProductGlyph form="drops" tone="forest" size="lg" />
                </ProductStage>
              </Parallax>
            </div>

            {/* -------------------------------------------------- benefits */}
            <Reveal stagger="[data-offer-benefit]" className="grid gap-2.5">
              {offerCampaign.benefits.map((benefit) => {
                const Icon = ICONS[benefit.icon];
                return (
                  <div
                    key={benefit.id}
                    data-offer-benefit
                    className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/6 px-4 py-3.5"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-cream">
                      <Icon aria-hidden className="size-4" strokeWidth={1.6} />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-[0.8125rem] font-medium text-cream">
                        {benefit.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-cream/60">
                        {benefit.detail}
                      </span>
                    </span>
                  </div>
                );
              })}
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
