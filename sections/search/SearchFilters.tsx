"use client";

import { useId, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { formLabel, type FilterSelection } from "@/lib/search/searchState";
import type { ApiFacets } from "@/types/api/search";

/** Longer groups fold behind "Show all" so the panel stays scannable. */
const COLLAPSED_COUNT = 6;

type FacetOption = { value: string; label: string; count: number };

type SearchFiltersProps = {
  facets: ApiFacets;
  value: FilterSelection;
  onChange: (next: FilterSelection) => void;
};

/**
 * The facet groups the listing contract returns that the search route
 * supports today: category (single choice), brand and form (any number).
 *
 * Controlled, so the desktop sidebar can apply every change at once while the
 * mobile sheet stages changes until the shopper asks for results.
 */
export function SearchFilters({ facets, value, onChange }: SearchFiltersProps) {
  const categories = withSelected(
    facets.categories.map((c) => ({ value: c.slug, label: c.name, count: c.count })),
    value.category ? [value.category] : [],
  );
  const brands = withSelected(
    facets.brands.map((b) => ({ value: b.value, label: b.label ?? b.value, count: b.count })),
    value.brand,
  );
  const forms = withSelected(
    facets.forms.map((f) => ({ value: f.value, label: formLabel(f.value), count: f.count })),
    value.form,
  );

  const toggle = (group: "brand" | "form", item: string) => {
    const current = value[group];
    onChange({
      ...value,
      [group]: current.includes(item) ? current.filter((v) => v !== item) : [...current, item],
    });
  };

  return (
    <div className="space-y-7">
      {categories.length > 0 ? (
        <CategoryGroup
          options={categories}
          selected={value.category}
          onSelect={(category) => onChange({ ...value, category })}
        />
      ) : null}
      {brands.length > 0 ? (
        <CheckboxGroup
          legend="Brand"
          options={brands}
          selected={value.brand}
          onToggle={(brand) => toggle("brand", brand)}
        />
      ) : null}
      {forms.length > 0 ? (
        <CheckboxGroup
          legend="Form"
          options={forms}
          selected={value.form}
          onToggle={(form) => toggle("form", form)}
        />
      ) : null}
    </div>
  );
}

export function hasFacetOptions(facets: ApiFacets) {
  return facets.categories.length + facets.brands.length + facets.forms.length > 0;
}

/** A chosen value stays listed even when the facet no longer counts it, so it can be unticked. */
function withSelected(options: FacetOption[], selected: string[]): FacetOption[] {
  const missing = selected
    .filter((value) => !options.some((option) => option.value === value))
    .map((value) => ({ value, label: value, count: 0 }));
  return [...options, ...missing];
}

function OptionCount({ count }: { count: number }) {
  return (
    <span className="text-xs text-muted-ink/80 tabular-nums">
      {count}
      <span className="sr-only"> {count === 1 ? "product" : "products"}</span>
    </span>
  );
}

const legendClass = "mb-2.5 text-[0.8125rem] font-semibold tracking-wide text-ink uppercase";
const rowClass =
  "flex min-h-10 items-center gap-3 rounded-lg px-2 transition-colors hover:bg-ink/4";

function CategoryGroup({
  options,
  selected,
  onSelect,
}: {
  options: FacetOption[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}) {
  const id = useId();
  const choices = [{ value: "", label: "All categories", count: null }, ...options];

  return (
    <fieldset>
      <legend className={legendClass}>Category</legend>
      <div className="-mx-2">
        {choices.map((option, index) => {
          const inputId = `${id}-${index}`;
          const checked = (selected ?? "") === option.value;
          return (
            <div key={option.value || "all"} className={rowClass}>
              <input
                type="radio"
                id={inputId}
                name={`${id}-category`}
                checked={checked}
                onChange={() => onSelect(option.value || null)}
                className="size-4 shrink-0 cursor-pointer accent-forest"
              />
              <label
                htmlFor={inputId}
                className="flex flex-1 cursor-pointer items-center justify-between gap-3 py-2 text-sm"
              >
                <span className={cn(checked ? "font-semibold text-ink" : "text-muted-ink")}>
                  {option.label}
                </span>
                {option.count !== null ? <OptionCount count={option.count} /> : null}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

function CheckboxGroup({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: FacetOption[];
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
    <fieldset>
      <legend className={legendClass}>{legend}</legend>
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
                className="border-line bg-cream data-checked:border-forest data-checked:bg-forest"
              />
              <label
                htmlFor={inputId}
                className="flex flex-1 cursor-pointer items-center justify-between gap-3 py-2 text-sm"
              >
                <span className={cn(checked ? "font-semibold text-ink" : "text-muted-ink")}>
                  {option.label}
                </span>
                <OptionCount count={option.count} />
              </label>
            </div>
          );
        })}
      </div>
      {hidden > 0 || expanded ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((previous) => !previous)}
          className="mt-1 rounded-md py-1 text-[0.8125rem] font-semibold text-forest underline-offset-4 hover:underline"
        >
          {expanded ? "Show fewer" : `Show ${hidden} more`}
        </button>
      ) : null}
    </fieldset>
  );
}
