"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandCard } from "@/components/commerce/BrandCard";
import { Button } from "@/components/ui/button";
import { searchHref } from "@/lib/search/searchState";
import type { BrandSummary } from "@/lib/catalogue";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * Desktop columns for a result count: up to four, otherwise whichever of four
 * or three leaves the fewest empty places in the last row (5 → 3+2, 7 → 4+3).
 */
const columnsFor = (count: number) => {
  if (count <= 4) return Math.max(count, 1);
  const gap = (cols: number) => (cols - (count % cols)) % cols;
  return gap(3) < gap(4) ? 3 : 4;
};

const firstLetter = (name: string) => {
  const letter = name.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(letter) ? letter : "#";
};

/** "Dr. Reck" finds "Dr. Reckeweg": spaces and punctuation are ignored. */
const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * The A–Z directory on /brands: filter by name, or by first letter. Letters
 * with no brands stay visible but disabled, so the alphabet reads as a whole
 * and nobody lands on an empty letter. Typing a name clears the letter.
 * Brands are listed A–Z in one grid.
 */
export function BrandDirectory({ brands }: { brands: BrandSummary[] }) {
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState<string | null>(null);
  const inputId = useId();

  const available = new Set(brands.map((brand) => firstLetter(brand.name)));
  const letters = available.has("#") ? [...LETTERS, "#"] : LETTERS;
  const needle = normalise(query);
  const matches = brands.filter(
    (brand) =>
      (letter === null || firstLetter(brand.name) === letter) &&
      (needle === "" || normalise(brand.name).includes(needle)),
  );

  const noun = (count: number) => `${count} ${count === 1 ? "brand" : "brands"}`;
  const status = query.trim()
    ? `${noun(matches.length)} matching “${query.trim()}”`
    : letter
      ? `${noun(matches.length)} starting with ${letter}`
      : noun(matches.length);

  const reset = () => {
    setQuery("");
    setLetter(null);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <label htmlFor={inputId} className="sr-only">
            Search brands
          </label>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-ink" />
          <input
            id={inputId}
            type="search"
            value={query}
            autoComplete="off"
            spellCheck={false}
            placeholder="Search brands"
            onChange={(event) => {
              setQuery(event.target.value);
              setLetter(null);
            }}
            className="h-12 w-full rounded-xl border border-line bg-cream pr-11 pl-11 text-[0.9375rem] text-ink shadow-soft transition-[border-color,box-shadow] placeholder:text-muted-ink/80 hover:border-forest/30 focus:border-forest/60 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear brand search"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-ink hover:bg-ink/5 hover:text-ink"
            >
              <X aria-hidden className="size-4" />
            </button>
          ) : null}
        </div>
        <p role="status" className="text-sm text-muted-ink">
          {status}
        </p>
      </div>

      <div
        role="group"
        aria-label="Filter brands by first letter"
        className="dh-no-scrollbar -mx-5 mt-5 flex gap-1.5 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
      >
        <LetterButton label="All" pressed={letter === null} onClick={() => setLetter(null)} wide />
        {letters.map((l) => (
          <LetterButton
            key={l}
            label={l}
            pressed={letter === l}
            disabled={!available.has(l)}
            onClick={() => {
              setLetter(letter === l ? null : l);
              setQuery("");
            }}
          />
        ))}
      </div>

      {matches.length > 0 ? (
        // One A–Z grid. Its width follows the count (two brands get two
        // columns, seven get four) and the last row is centred, so a short
        // catalogue never leaves a ragged gap. Re-keyed per filter so a new
        // set settles in rather than snapping.
        <ul
          key={`${letter ?? "all"}-${needle}`}
          style={{ "--cols": columnsFor(matches.length) } as React.CSSProperties}
          className="mt-8 flex flex-wrap justify-center gap-3 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300"
        >
          {matches.map((brand) => (
            <li
              key={brand.slug}
              className="w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc((100%-(var(--cols)-1)*0.75rem)/var(--cols))]"
            >
              <BrandCard brand={brand} variant="row" thumbnails={brand.thumbnails} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-card border border-dashed border-line bg-cream/60 px-6 py-10 text-center">
          <p className="text-lg font-semibold text-ink">No brands match “{query.trim()}”</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-ink">
            Check the spelling, or search the catalogue — the name may belong to a product.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button type="button" variant="brandOutline" size="xl" onClick={reset}>
              Show all brands
            </Button>
            {query.trim() ? (
              <Button asChild variant="brand" size="xl">
                <Link href={searchHref({ q: query.trim() })}>Search products for “{query.trim()}”</Link>
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function LetterButton({
  label,
  pressed,
  disabled = false,
  wide = false,
  onClick,
}: {
  label: string;
  pressed: boolean;
  disabled?: boolean;
  wide?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid h-10 shrink-0 place-items-center rounded-full text-sm font-semibold transition-colors",
        wide ? "px-4" : "w-10",
        pressed
          ? "bg-forest-deep text-cream"
          : "border border-line bg-cream text-ink hover:border-forest/35 hover:text-forest",
        "disabled:border-transparent disabled:bg-transparent disabled:text-ink/25",
      )}
    >
      {label}
    </button>
  );
}
