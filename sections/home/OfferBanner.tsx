import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/Container";
import { SplitHeading } from "@/components/shared/SplitHeading";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { Reveal } from "@/components/shared/Reveal";
import { ICONS } from "@/lib/icons";
import type { TrustBenefit } from "@/types/content";

/** A real saving in the live catalogue (GET /api/shop/products, sorted by discount). */
export type CatalogueOffer = {
  /** The largest discount off MRP on sale right now, in whole percent. */
  maxDiscount: number;
  /** How many products are at least 10% below MRP. */
  count: number;
};

/**
 * Promises the shop can keep on every order: the maker is on every product
 * page, delivery is checked by pincode, and the backend prices every order
 * again before it is placed. Nothing about speed, coverage or payment methods
 * the shop's configuration may not support.
 */
const BENEFITS: TrustBenefit[] = [
  { id: "maker", title: "Maker on every pack", detail: "Know where each remedy comes from", icon: "shield-check" },
  { id: "pincode", title: "Delivery check", detail: "By pincode, before you order", icon: "truck" },
  { id: "prices", title: "Prices confirmed", detail: "Re-checked by the shop at checkout", icon: "credit-card" },
];

/**
 * The campaign banner — the page's one dark, cinematic band.
 *
 * Set as an inset block with a deep radius rather than a full-bleed strip, so
 * the ivory page reads as the paper it is printed on. That inset is also the
 * page's main organic transition into the footer, which is why there is no wave
 * separator anywhere above it (brain/11_ANIMATION_SPEC.md, pattern H).
 *
 * The offer is the catalogue's own: the biggest discount on sale today and
 * how many products are at least 10% below MRP, linking to that listing. The
 * backend has no public promotions source, so no campaign, code or deadline is
 * invented. With nothing discounted (or the shop unreachable) the band stays,
 * inviting shoppers to the catalogue without any price claim.
 *
 * Background uses /Images/SeasonalEditBG.webp with a warm illuminated bottle
 * and organic botanicals.
 */
export function OfferBanner({ offer }: { offer: CatalogueOffer | null }) {
  const href = offer ? (offer.count > 0 ? "/products?discount=10&sort=discount" : "/products?sort=discount") : "/products";
  return (
    <section
      aria-labelledby="offer-heading"
      className="bg-ivory px-3 pt-4 pb-8 sm:px-5 md:pt-8 md:pb-12"
    >
      <Container width="wide" className="px-0 sm:px-0 lg:px-0">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-forest-deep md:rounded-[2.5rem]">
          {/* Background image */}
          <Image
            src="/Images/SeasonalEditBG.webp"
            alt="DocHomoeo seasonal offer background"
            fill
            sizes="(max-width: 1280px) 100vw, 1400px"
            className="pointer-events-none object-cover object-center select-none"
            draggable={false}
            priority={false}
          />
          {/* Subtle gradient overlay to keep typography on the left and pills on the right sharp while showcasing the bottle */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0d2a1f]/92 via-[#0d2a1f]/35 to-[#0d2a1f]/80 lg:from-[#0d2a1f]/88 lg:via-transparent lg:to-[#0d2a1f]/75"
          />

          <div className="relative grid items-center gap-10 px-6 py-12 sm:px-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)_minmax(0,0.58fr)] lg:gap-10 lg:px-14 lg:py-12 xl:px-20">
            {/* ------------------------------------------------------- copy */}
            <div className="max-w-[26rem]">
              <Reveal>
                <Eyebrow rule className="text-cream/70">
                  {offer ? "Biggest savings" : "The DocHomoeo shop"}
                </Eyebrow>
              </Reveal>

              <SplitHeading
                id="offer-heading"
                lines={offer ? [`Save up to ${offer.maxDiscount}%`, "on genuine remedies"] : ["Genuine remedies,", "from makers you know"]}
                className="mt-5 text-[2.25rem] leading-[1.02] text-cream sm:text-[2.875rem] lg:text-[3.25rem]"
              />

              <Reveal delay={0.12}>
                <p className="mt-5 max-w-[36ch] text-[0.9375rem] leading-relaxed text-cream/70">
                  {offer
                    ? `${
                        offer.count > 0
                          ? `${offer.count} ${offer.count === 1 ? "remedy is" : "remedies are"} priced at least 10% below the printed MRP right now.`
                          : "Selected remedies are priced below the printed MRP right now."
                      } Every price is confirmed again when you check out.`
                    : "Dilutions, tablets, mother tinctures and ointments, each with its maker named, checked for delivery to your pincode before you order."}
                </p>

                <Button
                  asChild
                  variant="brandOnDark"
                  size="pill"
                  className="mt-8"
                >
                  <Link href={href}>
                    {offer ? "Shop the savings" : "Shop all remedies"}
                    <ArrowRight className="size-4" strokeWidth={1.8} />
                  </Link>
                </Button>
              </Reveal>
            </div>

            {/* ---------------------------------------------- product stage */}
            <div className="mx-auto w-full max-w-[16rem] sm:max-w-[18rem] lg:max-w-[17rem]">
              {/* Product is part of the background image */}
            </div>

            {/* -------------------------------------------------- benefits */}
            <Reveal stagger="[data-offer-benefit]" className="grid gap-2.5">
              {BENEFITS.map((benefit) => {
                const Icon = ICONS[benefit.icon];
                return (
                  <div
                    key={benefit.id}
                    data-offer-benefit
                    className="flex items-center gap-3 rounded-2xl border border-white/12 bg-forest-deep/55 px-4 py-3.5 backdrop-blur-md"
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
