"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { PageBreadcrumb, type Crumb } from "@/components/shared/PageBreadcrumb";
import { DemoContentNotice } from "@/components/shared/DemoContentNotice";
import { Button } from "@/components/ui/button";
import { FORM_NOUNS, activeFilterCount, formLabel, listingHref, type SearchState } from "@/lib/search/searchState";
import { ProductResults, useListingNavigation } from "@/sections/listing/ProductResults";
import type { ApiProductListingResponse } from "@/types/api/search";

interface ShopViewProps {
  /** The /products URL, parsed by lib/search/searchState (as /search and brand pages are). */
  state: SearchState;
  result: ApiProductListingResponse;
}

const shopHref = (state: SearchState) => listingHref("/products", state);

const list = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

/**
 * /products. The URL is the listing state; the shared catalogue
 * (sections/listing/ProductResults) renders filters, sort, chips, grid and
 * pagination, exactly as on /search and brand pages. This view only adds the
 * page's heading, worded from what is being browsed.
 */
export function ShopView({ state, result }: ShopViewProps) {
  const { view, isPending, refine } = useListingNavigation(state, shopHref);
  const { title, crumbs } = heading(state, result);
  const forms = result.facets.forms;
  const brandCount = result.facets.brands.length;
  const onlyForm = state.form.length === 1 ? state.form[0] : null;

  // Worded from the listing's own facets, so it is true for whatever is shown.
  // A chosen form describes the page; otherwise every form on offer does.
  const shownForms = state.form.length > 0 ? state.form : forms.map((form) => form.value);
  const formNouns = shownForms.slice(0, 4).map((form) => FORM_NOUNS[form] ?? form);
  const description =
    result.total === 0
      ? "Nothing is listed here right now."
      : `${formNouns.length ? `${list.format(formNouns).replace(/^./, (c) => c.toUpperCase())} ` : ""}from ${brandCount} ${
          brandCount === 1 ? "brand" : "brands"
        }.`;

  return (
    <>
      <section aria-labelledby="shop-heading" className="dh-band-sage pt-28 pb-8 sm:pt-32 lg:pb-10">
        <Container>
          <PageBreadcrumb items={crumbs} className="mb-5" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              <Eyebrow>Shop</Eyebrow>
              <h1 id="shop-heading" className="mt-2 font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">
                {title}
              </h1>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-ink sm:text-base">{description}</p>
            </div>

            {forms.length > 1 || onlyForm ? (
              <nav aria-label="Shop by form" className="self-start lg:self-end">
                <ul className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-line-soft bg-paper/95 p-1.5 shadow-xs backdrop-blur-sm sm:gap-2">
                  {forms.map((form) => {
                    const active = onlyForm === form.value;
                    return (
                      <li key={form.value}>
                        <Link
                          href={shopHref({ ...state, form: active ? [] : [form.value], page: 1 })}
                          scroll={false}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "inline-flex h-9 items-center gap-2 rounded-xl px-3.5 text-[0.8125rem] font-medium transition-all duration-200",
                            active
                              ? "bg-forest font-semibold text-white shadow-xs"
                              : "text-ink/80 hover:bg-forest/8 hover:text-forest",
                          )}
                        >
                          <span>{formLabel(form.value)}</span>
                          <span
                            className={cn(
                              "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] tabular-nums font-semibold",
                              active ? "bg-white/25 text-white" : "bg-forest/10 text-forest",
                            )}
                          >
                            {form.count}
                            <span className="sr-only"> products</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ) : null}
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

      <DemoContentNotice />
    </>
  );
}

function heading(state: SearchState, result: ApiProductListingResponse): { title: string; crumbs: Crumb[] } {
  const all: Crumb = { name: "Products", href: "/products" };
  if (state.q) return { title: `Results for “${state.q}”`, crumbs: [all, { name: "Search", href: shopHref(state) }] };
  if (result.category) {
    return {
      title: result.category.name,
      crumbs: [{ name: "Categories", href: "/categories" }, { name: result.category.name, href: shopHref({ ...state, page: 1 }) }],
    };
  }
  if (state.form.length === 1) {
    const name = formLabel(state.form[0]);
    return { title: name, crumbs: [all, { name, href: shopHref({ ...state, page: 1 }) }] };
  }
  return { title: "All products", crumbs: [all] };
}
