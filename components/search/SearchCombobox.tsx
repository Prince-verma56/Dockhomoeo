"use client";

import { Fragment, useEffect, useId, useRef, useState, useTransition } from "react";
import { ProductThumb } from "@/components/commerce/ProductThumb";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Factory, LayoutGrid, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { repositories } from "@/lib/repositories";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { formatPrice } from "@/lib/formatters/price";
import { DURATION, EASE_PREMIUM_BEZIER } from "@/lib/animation/motion";
import { MAX_QUERY_LENGTH, searchHref } from "@/lib/search/searchState";
import type { ApiSuggestResponse } from "@/types/api/search";

/** The backend answers suggestions from two characters (shop.routes.ts /suggest). */
const MIN_SUGGEST_LENGTH = 2;

type Option =
  | { kind: "query"; id: string; href: string; label: string }
  | {
      kind: "product";
      id: string;
      href: string;
      label: string;
      brand: string | null;
      image: string | null;
      price: number;
    }
  | { kind: "category" | "brand"; id: string; href: string; label: string };

type SuggestResult = { query: string; data: ApiSuggestResponse | null };

type SearchComboboxProps = {
  /** The query already in the URL; the field follows it when it changes. */
  defaultQuery?: string;
  size?: "lg" | "md";
  autoFocus?: boolean;
  className?: string;
  /** Lets the page run navigation in its own transition to show pending UI. */
  onNavigate?: (href: string) => void;
  pending?: boolean;
};

/**
 * Search field with typeahead, following the WAI-ARIA combobox-with-listbox
 * pattern: focus stays in the input, arrow keys move a virtual cursor through
 * the options (aria-activedescendant), Enter picks the active option or
 * submits the query, Escape closes the list.
 *
 * Without JavaScript it is a plain GET form to /search.
 */
export function SearchCombobox({
  defaultQuery = "",
  size = "md",
  autoFocus = false,
  className,
  onNavigate,
  pending = false,
}: SearchComboboxProps) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [ownPending, startTransition] = useTransition();
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const listboxId = `${baseId}-listbox`;
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(defaultQuery);
  // Follow the URL when it changes underneath us (back/forward, a header
  // search), adjusting state during render rather than in an effect.
  const [syncedDefault, setSyncedDefault] = useState(defaultQuery);
  if (defaultQuery !== syncedDefault) {
    setSyncedDefault(defaultQuery);
    setQuery(defaultQuery);
  }

  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [result, setResult] = useState<SuggestResult | null>(null);

  const trimmed = query.trim();
  const debounced = useDebounce(trimmed, 200);
  const suggestable = trimmed.length >= MIN_SUGGEST_LENGTH;

  useEffect(() => {
    if (debounced.length < MIN_SUGGEST_LENGTH) return;
    // Responses can land out of order; only the latest request may write.
    let current = true;
    repositories.search.suggest(debounced).then(
      (data) => current && setResult({ query: debounced, data }),
      () => current && setResult({ query: debounced, data: null }),
    );
    return () => {
      current = false;
    };
  }, [debounced]);

  // Keep the previous answer on screen while the next one loads, so the list
  // does not collapse and reopen on every keystroke, but only while the text
  // still extends (or trims) what that answer was for.
  const related =
    result !== null &&
    (trimmed.startsWith(result.query) || result.query.startsWith(trimmed));
  const shown = suggestable && related ? result : null;
  const loading = suggestable && result?.query !== trimmed;
  const failed = !loading && shown !== null && shown.data === null;

  const options: Option[] = [];
  if (suggestable) {
    options.push({ kind: "query", id: `${baseId}-query`, href: searchHref({ q: trimmed }), label: trimmed });
  }
  shown?.data?.products.forEach((p, i) =>
    options.push({
      kind: "product",
      id: `${baseId}-product-${i}`,
      href: `/product/${p.slug}`,
      label: p.name,
      brand: p.brandName,
      image: p.imageUrl,
      price: p.price,
    }),
  );
  shown?.data?.categories.forEach((c, i) =>
    options.push({ kind: "category", id: `${baseId}-category-${i}`, href: searchHref({ q: c.name }), label: c.name }),
  );
  shown?.data?.brands.forEach((b, i) =>
    options.push({ kind: "brand", id: `${baseId}-brand-${i}`, href: searchHref({ q: b.name }), label: b.name }),
  );

  const expanded = open && suggestable;
  // An id that no longer matches an option (the list changed) means "none".
  const activeIndex = options.findIndex((option) => option.id === activeId);
  const activeOption = expanded && activeIndex >= 0 ? options[activeIndex] : undefined;
  const activeOptionId = activeOption?.id;
  const matchCount = options.length - (suggestable ? 1 : 0);

  useEffect(() => {
    if (activeOptionId) document.getElementById(activeOptionId)?.scrollIntoView({ block: "nearest" });
  }, [activeOptionId]);

  const navigate = (href: string) => {
    setOpen(false);
    setActiveId(null);
    if (onNavigate) onNavigate(href);
    else startTransition(() => router.push(href));
  };

  const move = (delta: 1 | -1) => {
    if (options.length === 0) return;
    const next =
      activeIndex === -1
        ? delta === 1 ? 0 : options.length - 1
        : (activeIndex + delta + options.length) % options.length;
    setActiveId(options[next].id);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!expanded) setOpen(true);
      else move(1);
    } else if (event.key === "ArrowUp") {
      if (!expanded) return;
      event.preventDefault();
      move(-1);
    } else if (event.key === "Enter" && activeOption) {
      event.preventDefault();
      navigate(activeOption.href);
    } else if (event.key === "Escape" && expanded) {
      // Close first; a second Escape falls through to the browser's own clear.
      event.preventDefault();
      setOpen(false);
      setActiveId(null);
    }
  };

  const busy = pending || ownPending;
  const large = size === "lg";

  const announcement = !expanded || loading
    ? ""
    : failed
      ? "Suggestions are unavailable. Press Enter to search."
      : matchCount === 0
        ? "No quick matches. Press Enter to search all products."
        : `${matchCount} suggestion${matchCount === 1 ? "" : "s"} available.`;

  return (
    <div
      className={cn("relative w-full", className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <form
        role="search"
        action="/search"
        onSubmit={(event) => {
          event.preventDefault();
          if (!trimmed) {
            inputRef.current?.focus();
            return;
          }
          navigate(searchHref({ q: trimmed }));
        }}
        className="relative flex items-center"
      >
        <label htmlFor={inputId} className="sr-only">
          Search medicines, brands and health concerns
        </label>
        <Search
          aria-hidden
          strokeWidth={1.8}
          className={cn(
            "pointer-events-none absolute text-muted-ink",
            large ? "left-5 size-5" : "left-4 size-4.5",
          )}
        />
        <input
          ref={inputRef}
          id={inputId}
          name="q"
          type="search"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={expanded ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          maxLength={MAX_QUERY_LENGTH}
          // Only the bare /search landing asks for this: taking a query is
          // its whole purpose.
          autoFocus={autoFocus}
          value={query}
          placeholder="Search by medicine, brand or health concern"
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveId(null);
            setOpen(true);
          }}
          // Opens on typing, ArrowDown or a click — not on focus, so tabbing
          // past a prefilled field does not drop a list over the results.
          onClick={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            "w-full min-w-0 border border-line bg-cream text-ink shadow-soft transition-[border-color,box-shadow] duration-200 placeholder:text-muted-ink/80",
            "hover:border-forest/30 focus:border-forest/60 focus:shadow-lift",
            "[&::-webkit-search-cancel-button]:appearance-none",
            // Right padding clears whichever buttons are showing.
            large
              ? cn(
                  "h-14 rounded-2xl pl-13 text-base sm:h-16 sm:text-[1.0625rem]",
                  query ? "pr-24 sm:pr-44" : "pr-15 sm:pr-34",
                )
              : cn("h-12 rounded-xl pl-11 text-[0.9375rem]", query ? "pr-22" : "pr-12"),
          )}
        />
        <div className={cn("absolute flex items-center gap-1", large ? "right-2" : "right-1.5")}>
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setActiveId(null);
                inputRef.current?.focus();
              }}
              className="grid size-9 place-items-center rounded-full text-muted-ink transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <X aria-hidden className="size-4" />
            </button>
          ) : null}
          <button
            type="submit"
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl bg-forest font-semibold text-cream shadow-soft transition-colors hover:bg-forest-deep",
              large ? "size-11 text-sm sm:h-12 sm:w-auto sm:px-5" : "size-9",
            )}
          >
            {busy ? (
              <Loader2 aria-hidden className="size-4 motion-safe:animate-spin" />
            ) : large ? (
              <Search aria-hidden className="size-4 sm:hidden" strokeWidth={2} />
            ) : (
              <ArrowRight aria-hidden className="size-4" />
            )}
            {/* Visible beside the large field from sm up; always the button's name. */}
            <span className={large ? "sr-only sm:not-sr-only" : "sr-only"}>Search</span>
          </button>
        </div>
      </form>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <AnimatePresence>
        {expanded ? (
          <motion.div
            key="suggestions"
            initial={reducedMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6 }}
            transition={{ duration: DURATION.fast, ease: EASE_PREMIUM_BEZIER }}
            className="absolute inset-x-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-2xl border border-line bg-cream shadow-float"
          >
            <div
              role="listbox"
              id={listboxId}
              aria-label="Search suggestions"
              // Focus stays in the input; without this Chrome makes the
              // scrolling list its own tab stop.
              tabIndex={-1}
              className="max-h-[min(60vh,440px)] overflow-y-auto overscroll-contain p-1.5"
            >
              {options.map((option, index) => {
                const startsGroup = index === 0 || options[index - 1].kind !== option.kind;
                return (
                  <Fragment key={option.id}>
                    {/* Visual group label only: each option already says what
                        it is, and options must be the listbox's children. */}
                    {startsGroup && option.kind !== "query" ? (
                      <p
                        aria-hidden
                        className="dh-eyebrow px-3 pt-3 pb-1.5 text-[0.66rem] text-muted-ink"
                      >
                        {GROUP_LABELS[option.kind]}
                      </p>
                    ) : null}
                    <SuggestionOption
                      option={option}
                      active={option.id === activeOptionId}
                      onHover={() => setActiveId(option.id)}
                      onSelect={() => navigate(option.href)}
                    />
                  </Fragment>
                );
              })}
            </div>

            {loading || failed || matchCount === 0 ? (
              <p className="flex items-center gap-2 border-t border-line/70 bg-cream-sunk/60 px-4 py-2.5 text-xs text-muted-ink">
                {loading ? (
                  <>
                    <Loader2 aria-hidden className="size-3.5 motion-safe:animate-spin" />
                    Finding matches…
                  </>
                ) : failed ? (
                  "Suggestions are unavailable right now. Press Enter to search."
                ) : (
                  "No quick matches. Press Enter to search all products."
                )}
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const GROUP_LABELS = {
  product: "Medicines",
  category: "Categories",
  brand: "Brands",
} as const;

function SuggestionOption({
  option,
  active,
  onHover,
  onSelect,
}: {
  option: Option;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
}) {
  return (
    <div
      role="option"
      id={option.id}
      aria-selected={active}
      // Keep focus in the input so the combobox never loses its place.
      onMouseDown={(event) => event.preventDefault()}
      onMouseMove={active ? undefined : onHover}
      onClick={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink transition-colors",
        active ? "bg-sage-tint" : "hover:bg-sage-tint/60",
      )}
    >
      {option.kind === "query" ? (
        <>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-forest/8 text-forest">
            <Search aria-hidden className="size-4" strokeWidth={1.8} />
          </span>
          <span className="min-w-0 flex-1 truncate">
            Search for <span className="font-semibold">“{option.label}”</span>
          </span>
          <ArrowRight aria-hidden className="size-4 shrink-0 text-muted-ink" />
        </>
      ) : option.kind === "product" ? (
        <>
          <ProductThumb imageUrl={option.image} name={option.label} sizes="44px" className="size-11 rounded-lg" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{option.label}</span>
            {option.brand ? (
              <span className="block truncate text-xs text-muted-ink">{option.brand}</span>
            ) : null}
          </span>
          <span className="shrink-0 text-sm font-semibold tabular-nums">
            {formatPrice({ amount: option.price, currency: "INR" })}
          </span>
        </>
      ) : (
        <>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink/5 text-muted-ink">
            {option.kind === "category" ? (
              <LayoutGrid aria-hidden className="size-4" strokeWidth={1.8} />
            ) : (
              <Factory aria-hidden className="size-4" strokeWidth={1.8} />
            )}
          </span>
          <span className="min-w-0 flex-1 truncate">{option.label}</span>
          <span className="shrink-0 text-xs text-muted-ink">
            {option.kind === "category" ? "Category" : "Brand"}
          </span>
        </>
      )}
    </div>
  );
}
