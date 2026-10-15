"use client";

import { useId, useState, type ReactNode } from "react";
import { Star } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { formatRupees } from "@/lib/formatters/price";
import { formLabel, potencyLabel, type FilterSelection } from "@/lib/search/searchState";
import type { ApiFacets } from "@/types/api/search";

/** Longer groups fold behind "Show more" so the panel stays scannable. */
const COLLAPSED_COUNT = 6;

/** `count` is null for a chosen value the facets no longer count. */
type FacetOption = { value: string; label: string; count: number | null };

type SearchFiltersProps = {
  facets: ApiFacets;
  /**
   * Display name of the chosen category when the facets do not list it —
   * e.g. a health concern (a top-level category) chosen from the header.
   */
  categoryName?: string | null;
  value: FilterSelection;
  onChange: (next: FilterSelection) => void;
};

type GroupKey = "category" | "brand" | "form" | "potency" | "pack" | "price" | "discount" | "rating" | "availability";

/**
 * The listing's filter panel: every group the listing contract supports
 * (GET /api/shop/products), each shown only when the facets give it options.
 *
 * Controlled, so the desktop sidebar applies each change at once while the
 * mobile sheet stages changes until the shopper asks for results.
 */
export function SearchFilters({ facets, value, onChange, categoryName }: SearchFiltersProps) {
  const categories = withSelected(
    facets.categories.map((c) => ({ value: c.slug, label: c.name, count: c.count })),
    value.category ? [value.category] : [],
    categoryName,
  );
  const brands = withSelected(
    facets.brands.map((b) => ({ value: b.value, label: b.label ?? b.value, count: b.count })),
    value.brand,
  );
  const forms = withSelected(
    facets.forms.map((f) => ({ value: f.value, label: formLabel(f.value), count: f.count })),
    value.form,
  );
  const potencies = withSelected(
    facets.potencies.map((p) => ({ value: p.value, label: potencyLabel(p.value), count: p.count })),
    value.potency,
  );
  const packs = withSelected(
    facets.packs.map((p) => ({ value: p.value, label: p.value, count: p.count })),
    value.pack,
  );
  const priceRange = facets.priceRange;
  const hasPrice = priceRange.max > priceRange.min || value.minPrice !== null || value.maxPrice !== null;

  const toggle = (group: "brand" | "form" | "potency" | "pack", item: string) => {
    const current = value[group];
    onChange({
      ...value,
      [group]: current.includes(item) ? current.filter((v) => v !== item) : [...current, item],
    });
  };

  // Open by default: the groups most shoppers use, plus any group in use.
  const used: GroupKey[] = [
    ...(value.potency.length ? (["potency"] as const) : []),
    ...(value.pack.length ? (["pack"] as const) : []),
    ...(value.discount ? (["discount"] as const) : []),
    ...(value.rating ? (["rating"] as const) : []),
    ...(value.inStock ? (["availability"] as const) : []),
  ];
  const [open, setOpen] = useState<string[]>(["category", "brand", "form", "price", ...used]);

  return (
    <Accordion type="multiple" value={open} onValueChange={setOpen} className="divide-y divide-line/70">
      {categories.length > 0 ? (
        <Group id="category" title="Category" selected={value.category ? 1 : 0}>
          <RadioList
            name="category"
            options={[{ value: "", label: "All categories", count: null }, ...categories]}
            selected={value.category ?? ""}
            onSelect={(category) => onChange({ ...value, category: category || null })}
          />
        </Group>
      ) : null}

      {brands.length > 0 ? (
        <Group id="brand" title="Brand" selected={value.brand.length}>
          <CheckboxList options={brands} selected={value.brand} onToggle={(brand) => toggle("brand", brand)} />
        </Group>
      ) : null}

      {forms.length > 0 ? (
        <Group id="form" title="Form" selected={value.form.length}>
          <CheckboxList options={forms} selected={value.form} onToggle={(form) => toggle("form", form)} />
        </Group>
      ) : null}

      {hasPrice ? (
        <Group id="price" title="Price" selected={value.minPrice !== null || value.maxPrice !== null ? 1 : 0}>
          <PriceRange
            key={`${value.minPrice}-${value.maxPrice}-${priceRange.min}-${priceRange.max}`}
            bounds={priceRange}
            min={value.minPrice}
            max={value.maxPrice}
            onCommit={(minPrice, maxPrice) => onChange({ ...value, minPrice, maxPrice })}
          />
        </Group>
      ) : null}

      {potencies.length > 0 ? (
        <Group id="potency" title="Potency" selected={value.potency.length}>
          <ul className="flex flex-wrap gap-2 pt-1" aria-label="Potency">
            {potencies.map((option) => {
              const pressed = value.potency.includes(option.value);
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => toggle("potency", option.value)}
                    className={cn(
                      "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[0.8125rem] font-medium transition-colors",
                      pressed
                        ? "border-forest bg-forest text-cream"
                        : "border-line bg-cream text-ink hover:border-forest/40",
                    )}
                  >
                    {option.label}
                    <span className={cn("text-xs tabular-nums", pressed ? "text-cream/75" : "text-muted-ink")}>
                      {option.count}
                      <span className="sr-only"> {option.count === 1 ? "product" : "products"}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Group>
      ) : null}

      {packs.length > 0 ? (
        <Group id="pack" title="Pack size" selected={value.pack.length}>
          <CheckboxList options={packs} selected={value.pack} onToggle={(pack) => toggle("pack", pack)} />
        </Group>
      ) : null}

      {facets.discounts.length > 0 || value.discount ? (
        <Group id="discount" title="Discount" selected={value.discount ? 1 : 0}>
          <RadioList
            name="discount"
            options={[
              { value: "", label: "Any", count: null },
              ...facets.discounts.map((d) => ({ value: String(d.value), label: `${d.value}% off or more`, count: d.count })),
            ]}
            selected={value.discount ? String(value.discount) : ""}
            onSelect={(discount) => onChange({ ...value, discount: discount ? Number(discount) : null })}
          />
        </Group>
      ) : null}

      {facets.ratings.length > 0 || value.rating ? (
        <Group id="rating" title="Customer rating" selected={value.rating ? 1 : 0}>
          <RadioList
            name="rating"
            options={[
              { value: "", label: "Any", count: null },
              ...facets.ratings.map((r) => ({
                value: String(r.value),
                label: (
                  <span className="inline-flex items-center gap-1">
                    {r.value}
                    <Star aria-hidden className="size-3.5 fill-warm text-warm" strokeWidth={1.5} />
                    <span>&amp; up</span>
                  </span>
                ),
                text: `${r.value} stars and up`,
                count: r.count,
              })),
            ]}
            selected={value.rating ? String(value.rating) : ""}
            onSelect={(rating) => onChange({ ...value, rating: rating ? Number(rating) : null })}
          />
        </Group>
      ) : null}

      <Group id="availability" title="Availability" selected={value.inStock ? 1 : 0}>
        <CheckboxList
          options={[{ value: "in-stock", label: "In stock only", count: null }]}
          selected={value.inStock ? ["in-stock"] : []}
          onToggle={() => onChange({ ...value, inStock: !value.inStock })}
        />
      </Group>
    </Accordion>
  );
}

export function hasFacetOptions(facets: ApiFacets) {
  return (
    facets.categories.length +
      facets.brands.length +
      facets.forms.length +
      facets.potencies.length +
      facets.packs.length +
      facets.discounts.length +
      facets.ratings.length >
      0 || facets.priceRange.max > facets.priceRange.min
  );
}

/** A chosen value stays listed even when the facet no longer counts it, so it can be unticked. */
function withSelected(options: FacetOption[], selected: string[], label?: string | null): FacetOption[] {
  const missing = selected
    .filter((value) => !options.some((option) => option.value === value))
    .map((value) => ({ value, label: label ?? value, count: null }));
  // A chosen value the facets do not list leads the group, where it is seen.
  return [...missing, ...options];
}

function Group({
  id,
  title,
  selected,
  children,
}: {
  id: GroupKey;
  title: string;
  selected: number;
  children: ReactNode;
}) {
  return (
    <AccordionItem value={id} className="border-0">
      <AccordionTrigger className="cursor-pointer items-center rounded-md py-3.5 text-[0.8125rem] font-semibold tracking-[0.06em] text-ink uppercase hover:no-underline">
        <span className="flex items-center gap-2">
          {title}
          {selected > 0 ? (
            <span className="grid min-w-5 place-items-center rounded-full bg-forest px-1.5 text-[0.6875rem] leading-5 font-semibold tracking-normal text-cream">
              {selected}
              <span className="sr-only"> selected</span>
            </span>
          ) : null}
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-4">{children}</AccordionContent>
    </AccordionItem>
  );
}

function OptionCount({ count }: { count: number }) {
  return (
    <span className="text-xs text-muted-ink/80 tabular-nums">
      {count}
      <span className="sr-only"> {count === 1 ? "product" : "products"}</span>
    </span>
  );
}

const rowClass = "flex min-h-10 items-center gap-3 rounded-lg px-2 transition-colors hover:bg-ink/4";

function RadioList({
  name,
  options,
  selected,
  onSelect,
}: {
  name: string;
  options: { value: string; label: ReactNode; text?: string; count: number | null }[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  const id = useId();
  return (
    <fieldset className="-mx-2">
      <legend className="sr-only">{name}</legend>
      {options.map((option, index) => {
        const inputId = `${id}-${index}`;
        const checked = selected === option.value;
        return (
          <div key={option.value || "any"} className={rowClass}>
            <input
              type="radio"
              id={inputId}
              name={`${id}-${name}`}
              checked={checked}
              aria-label={option.text}
              onChange={() => onSelect(option.value)}
              className="size-4 shrink-0 cursor-pointer accent-forest"
            />
            <label htmlFor={inputId} className="flex flex-1 cursor-pointer items-center justify-between gap-3 py-2 text-sm">
              <span className={cn(checked ? "font-semibold text-ink" : "text-muted-ink")}>{option.label}</span>
              {option.count !== null ? <OptionCount count={option.count} /> : null}
            </label>
          </div>
        );
      })}
    </fieldset>
  );
}

function CheckboxList({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; label: string; count: number | null }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  // Never fold a ticked option out of sight.
  const visible = expanded
    ? options
    : options.filter((option, index) => index < COLLAPSED_COUNT || selected.includes(option.value));
  const hidden = options.length - visible.length;

  return (
    <div className="-mx-2">
      {visible.map((option, index) => {
        const inputId = `${id}-${index}`;
        const checked = selected.includes(option.value);
        return (
          <div key={option.value} className={rowClass}>
            <Checkbox
              id={inputId}
              checked={checked}
              onCheckedChange={() => onToggle(option.value)}
              className="cursor-pointer border-line bg-cream data-checked:border-forest data-checked:bg-forest"
            />
            <label htmlFor={inputId} className="flex flex-1 cursor-pointer items-center justify-between gap-3 py-2 text-sm">
              <span className={cn(checked ? "font-semibold text-ink" : "text-muted-ink")}>{option.label}</span>
              {option.count !== null ? <OptionCount count={option.count} /> : null}
            </label>
          </div>
        );
      })}
      {hidden > 0 || expanded ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((previous) => !previous)}
          className="mt-1 ml-2 cursor-pointer rounded-md py-1 text-[0.8125rem] font-semibold text-forest underline-offset-4 hover:underline"
        >
          {expanded ? "Show fewer" : `Show ${hidden} more`}
        </button>
      ) : null}
    </div>
  );
}

/** Rounds the facet's bounds outward to a tidy step for the slider. */
const STEP = 10;

function PriceRange({
  bounds,
  min,
  max,
  onCommit,
}: {
  bounds: { min: number; max: number };
  min: number | null;
  max: number | null;
  onCommit: (min: number | null, max: number | null) => void;
}) {
  const floor = Math.floor(Math.min(bounds.min, min ?? bounds.min) / STEP) * STEP;
  const ceiling = Math.max(floor + STEP, Math.ceil(Math.max(bounds.max, max ?? bounds.max) / STEP) * STEP);
  const [range, setRange] = useState<[number, number]>([
    Math.max(floor, min ?? floor),
    Math.min(ceiling, max ?? ceiling),
  ]);

  const commit = ([lo, hi]: number[]) =>
    onCommit(lo <= floor ? null : lo, hi >= ceiling ? null : hi);

  return (
    <div className="px-1 pt-2">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="rounded-md border border-line bg-cream px-2.5 py-1 font-medium text-ink tabular-nums">
          {formatRupees(range[0])}
        </span>
        <span aria-hidden className="h-px w-4 bg-line" />
        <span className="rounded-md border border-line bg-cream px-2.5 py-1 font-medium text-ink tabular-nums">
          {formatRupees(range[1])}
          {range[1] >= ceiling ? "+" : ""}
        </span>
      </div>
      <Slider
        min={floor}
        max={ceiling}
        step={STEP}
        minStepsBetweenThumbs={1}
        value={range}
        onValueChange={(next) => setRange([next[0], next[1]])}
        onValueCommit={commit}
        thumbLabels={["Minimum price", "Maximum price"]}
      />
      <p className="mt-3 text-xs text-muted-ink">
        Prices in this listing run from {formatRupees(bounds.min)} to {formatRupees(bounds.max)}.
      </p>
    </div>
  );
}
