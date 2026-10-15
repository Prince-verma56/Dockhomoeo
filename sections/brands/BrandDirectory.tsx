"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { BrandMark } from "@/components/commerce/BrandMark";
import { brandOrigin, countLabel } from "@/components/commerce/BrandCard";
import { searchHref } from "@/lib/search/searchState";
import type { BrandSummary } from "@/lib/catalogue";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const firstLetter = (name: string) => {
  const letter = name.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(letter) ? letter : "#";
};

/** "Dr. Reck" finds "Dr. Reckeweg": spaces and punctuation are ignored. */
const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * The A–Z manufacturer index on /brands, set like the index of a book: a
 * letter in the gutter, the makers under it on hairline rows. Filter by name
 * or by first letter. Letters with no brands stay visible but disabled, so the
 * alphabet reads as a whole and nobody lands on an empty letter. Typing a name
 * clears the letter.
 *
 * `ranges` is a data-derived line per brand slug (the forms it is stocked in).
 */
export function BrandDirectory({
  brands,
  ranges = {},
  headingId,
}: {
  brands: BrandSummary[];
  ranges?: Record<string, string>;
  headingId: string;
}) {
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

  const groups = new Map<string, BrandSummary[]>();
  for (const brand of matches) {
    const key = firstLetter(brand.name);
    groups.set(key, [...(groups.get(key) ?? []), brand]);
  }

  const noun = (count: number) => `${count} ${count === 1 ? "brand" : "brands"}`;
  const status = query.trim()
    ? `${noun(matches.length)} matching “${query.trim()}”`
    : letter
      ? `${noun(matches.length)} starting with letter ${letter}`
      : `Showing all ${noun(matches.length)}`;

  const reset = () => {
    setQuery("");
    setLetter(null);
  };

  return (
    <div>
      <div className="dh-head-gap flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div className="max-w-xl">
          <Eyebrow className="mb-3">Manufacturer index</Eyebrow>
          <h2 id={headingId} className="dh-title-section text-ink">
            Every maker, A–Z
          </h2>
          <p className="dh-body mt-2.5">
            Search by name or jump to a letter. Each maker opens on its full range in our catalogue.
          </p>
        </div>

        <div className="w-full lg:max-w-sm">
          <div className="relative">
            <label htmlFor={inputId} className="sr-only">
              Search manufacturers by name
            </label>
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-ink"
            />
            <input
              id={inputId}
              type="search"
              value={query}
              autoComplete="off"
              spellCheck={false}
              placeholder="Search manufacturers…"
              onChange={(event) => {
                setQuery(event.target.value);
                setLetter(null);
              }}
              className="h-12 w-full rounded-full border border-line-soft bg-paper pr-11 pl-11 text-[0.9375rem] text-ink shadow-soft transition-[border-color,box-shadow] placeholder:text-muted-ink/70 hover:border-forest/30 focus:border-forest focus:ring-2 focus:ring-forest/15 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear brand search"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-ink transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <X aria-hidden className="size-4" />
              </button>
            ) : null}
          </div>
          <p role="status" className="dh-meta mt-2.5 px-1">
            {status}
          </p>
        </div>
      </div>

      {/* One line of letters across the full measure; a swipeable strip on phones. */}
      <div
        role="group"
        aria-label="Filter brands by first letter"
        className="dh-no-scrollbar -mx-5 flex gap-1 overflow-x-auto border-y border-line px-5 py-2.5 sm:-mx-8 sm:px-8 lg:mx-0 lg:justify-between lg:overflow-visible lg:px-0"
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
        <div
          key={`${letter ?? "all"}-${needle}`}
          className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300"
        >
          {[...groups].map(([key, group]) => (
            <section
              key={key}
              aria-label={`Brands starting with ${key}`}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)] border-b border-line sm:grid-cols-[4.5rem_minmax(0,1fr)]"
            >
              <span aria-hidden className="pt-4 font-display text-3xl leading-none text-forest/30 sm:pt-5 sm:text-4xl">
                {key}
              </span>
              <ul className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-10">
                {group.map((brand) => (
                  <li key={brand.slug} className="border-t border-line-soft first:border-t-0 lg:[&:nth-child(2)]:border-t-0">
                    <IndexRow brand={brand} range={ranges[brand.slug]} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-paper/80 px-6 py-12 text-center">
          <p className="text-lg font-semibold text-ink">No brands match “{query.trim()}”</p>
          <p className="dh-body mx-auto mt-1.5 max-w-sm">
            Check the spelling, or search the catalogue directly — the name may belong to an individual remedy.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button type="button" variant="brandOutline" size="xl" onClick={reset}>
              Show all brands
            </Button>
            {query.trim() ? (
              <Button asChild variant="brand" size="xl">
                <Link href={searchHref({ q: query.trim() })}>Search remedies for “{query.trim()}”</Link>
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function IndexRow({ brand, range }: { brand: BrandSummary; range?: string }) {
  const origin = brandOrigin(brand.slug);
  const detail = [origin, range].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/brands/${brand.slug}`}
      className="group -mx-2 flex items-center gap-4 rounded-xl px-2 py-4 transition-colors duration-300 hover:bg-paper sm:-mx-3 sm:px-3"
    >
      {brand.logoUrl ? <BrandMark name={brand.name} logoUrl={brand.logoUrl} size="sm" /> : null}
      <span className="min-w-0 flex-1">
        <span className="dh-title-card block text-ink transition-colors group-hover:text-forest">
          {brand.name}
        </span>
        <span className="dh-meta mt-1 block truncate">
          <span className="sm:hidden">
            {countLabel(brand.productCount)}
            {detail ? " · " : null}
          </span>
          {detail}
        </span>
      </span>
      <span className="dh-meta hidden shrink-0 tabular-nums sm:block">{countLabel(brand.productCount)}</span>
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-ink transition-[background-color,border-color,color,transform] duration-300 ease-premium group-hover:translate-x-0.5 group-hover:border-forest group-hover:bg-forest group-hover:text-cream"
      >
        <ArrowUpRight className="size-4" />
      </span>
    </Link>
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
        "grid h-9 shrink-0 place-items-center rounded-full text-sm font-semibold transition-colors duration-200",
        wide ? "px-4" : "w-9 lg:w-8 xl:w-9",
        pressed ? "bg-forest text-cream" : "text-ink hover:bg-paper hover:text-forest",
        "disabled:cursor-not-allowed disabled:bg-transparent disabled:font-normal disabled:text-ink/20",
      )}
    >
      {label}
    </button>
  );
}
