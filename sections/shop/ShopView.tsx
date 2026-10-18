"use client";

import Link from "next/link";
import { Leaf, FlaskConical, ShieldCheck } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { shopHeading } from "@/lib/navigation/crumbs";
import { Button } from "@/components/ui/button";
import { activeFilterCount, listingHref, type SearchState } from "@/lib/search/searchState";
import { ProductResults, useListingNavigation } from "@/sections/listing/ProductResults";
import type { ApiProductListingResponse } from "@/types/api/search";

interface ShopViewProps {
  /** The /products URL, parsed by lib/search/searchState (as /search and brand pages are). */
  state: SearchState;
  result: ApiProductListingResponse;
}

const shopHref = (state: SearchState) => listingHref("/products", state);

/**
 * /products view styled to match the luxury apothecary design:
 * - Natural travertine stone and amber glass hero banner
 * - Non-rounded bottom seam on hero section
 * - Rounded top border in second section (ProductResults)
 * - Trust badges (100% Natural, Lab Tested, Trusted by 10K+ Families)
 * - Hero focuses purely on brand narrative / detailing
 * - Filter tabs live below in the product section
 */
export function ShopView({ state, result }: ShopViewProps) {
  const { view, isPending, refine } = useListingNavigation(state, shopHref);
  const { title, crumbs } = shopHeading(state, result);

  return (
    <>
      <section
        aria-labelledby="shop-heading"
        className="relative overflow-hidden pt-28 pb-10 sm:pt-32 sm:pb-12 lg:pt-36 lg:pb-14 rounded-none bg-[#f5f2eb]"
      >
        {/* Luxury travertine & amber dropper bottle background image */}
        <div
          className="pointer-events-none absolute inset-0 select-none bg-cover bg-right lg:bg-[center_right_6%] opacity-90 transition-opacity duration-700"
          style={{ backgroundImage: "url('/Images/ProductsHeroBG.jpg')" }}
        />

        {/* Soft cream-to-transparent overlay ensuring supreme text contrast */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#fbf9f4]/95 via-[#fbf9f4]/85 to-transparent sm:via-[#fbf9f4]/75" />

        <Container className="relative z-10">
          <PageBreadcrumb items={crumbs} className="mb-4 text-xs font-medium text-muted-ink" structuredData={false} />

          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-[#ded5c2] bg-[#eee8db]/90 px-3 py-0.5 text-[0.6875rem] font-bold tracking-widest text-ink/75 uppercase backdrop-blur-xs">
              SHOP
            </span>

            <h1
              id="shop-heading"
              className="mt-3 font-display text-4xl leading-[1.06] font-bold tracking-tight text-ink sm:text-5xl lg:text-[3.5rem]"
            >
              {title}
            </h1>

            <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-[#55645d] sm:text-base">
              Pure extracts. Gentle healing. Backed by nature and trusted homeopathy.
            </p>

            {/* Trust badges row */}
            <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-7">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-full border border-forest/20 bg-paper/85 text-forest shadow-xs backdrop-blur-xs">
                  <Leaf className="size-4" strokeWidth={1.8} />
                </div>
                <span className="text-xs font-semibold leading-tight text-ink sm:text-[0.8125rem]">
                  100% Natural<br />Formulas
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-full border border-forest/20 bg-paper/85 text-forest shadow-xs backdrop-blur-xs">
                  <FlaskConical className="size-4" strokeWidth={1.8} />
                </div>
                <span className="text-xs font-semibold leading-tight text-ink sm:text-[0.8125rem]">
                  Lab Tested<br />&amp; Safe
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-full border border-forest/20 bg-paper/85 text-forest shadow-xs backdrop-blur-xs">
                  <ShieldCheck className="size-4" strokeWidth={1.8} />
                </div>
                <span className="text-xs font-semibold leading-tight text-ink sm:text-[0.8125rem]">
                  Trusted by<br />10K+ Families
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <ProductResults
        state={state}
        view={view}
        result={result}
        pending={isPending}
        hrefFor={shopHref}
        onRefine={refine}
        hasHeroTabs={false}
        label={typeof title === "string" ? title : "Products"}
        emptyState={
          <div className="rounded-card border border-dashed border-line bg-cream/60 px-6 py-14 text-center">
            <h2 className="text-lg font-semibold text-ink">Nothing is listed here yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-ink">
              {activeFilterCount(state) > 0 || state.q
                ? "Try a broader search, or browse the whole catalogue."
                : "Products appear here as soon as the shop lists them."}
            </p>
            <Button asChild variant="brand" size="xl" className="mt-6">
              <Link href="/categories">Browse by category</Link>
            </Button>
          </div>
        }
      />
    </>
  );
}
