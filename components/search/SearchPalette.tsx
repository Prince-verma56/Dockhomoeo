"use client";

import { Fragment, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { ArrowRight, Clock, CornerDownLeft, Factory, LayoutGrid, Loader2, Search, Stethoscope, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { repositories } from "@/lib/repositories";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { formatPrice } from "@/lib/formatters/price";
import { MAX_QUERY_LENGTH, searchHref } from "@/lib/search/searchState";
import { ProductThumb } from "@/components/commerce/ProductThumb";
import { getLenis } from "@/components/providers/SmoothScrollProvider";
import type { ApiSuggestResponse } from "@/types/api/search";

/* ---------------------------------------------------------------------------
   Opening the palette

   Any number of triggers (the header field, the phone icon) dispatch one
   window event; a single <SearchPalette /> listens. Triggers are links to
   /search, so without JavaScript they still lead to the search page.
   ------------------------------------------------------------------------- */

const OPEN_EVENT = "dh:open-search";

export function openSearch() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/** The backend answers suggestions from two characters (shop.routes.ts /suggest). */
const MIN_SUGGEST_LENGTH = 2;
const RECENT_KEY = "dh:recent-searches";
const RECENT_LIMIT = 5;

type Scope = "all" | "product" | "category" | "brand";

type Option =
  | { kind: "query"; id: string; href: string; label: string }
  | { kind: "recent"; id: string; href: string; label: string }
  /** The same words against the doctor directory (GET /api/care/doctors?q=). */
  | { kind: "doctors"; id: string; href: string; label: string }
  | { kind: "product"; id: string; href: string; label: string; brand: string | null; image: string | null; price: number }
  | { kind: "category" | "brand"; id: string; href: string; label: string };

type SuggestResult = { query: string; data: ApiSuggestResponse | null };
type Browse = { concerns: { name: string; slug: string; count: number }[]; brands: { name: string; slug: string; count: number }[] };

const SCOPES: { key: Scope; label: string }[] = [
  { key: "all", label: "All" },
  { key: "product", label: "Medicines" },
  { key: "category", label: "Categories" },
  { key: "brand", label: "Brands" },
];

const GROUP_LABELS = { product: "Medicines", category: "Categories", brand: "Brands" } as const;

/* ------------------------------------------------------------- recent queries */

function readRecent(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, RECENT_LIMIT) : [];
  } catch {
    return [];
  }
}

function writeRecent(list: string[]) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_LIMIT)));
  } catch {
    // Private mode or blocked storage: recents are a convenience, not a requirement.
  }
}

/** Bolds the parts of `text` that match any word of the query. */
function Highlight({ text, query }: { text: string; query: string }) {
  const words = query.trim().split(/\s+/).filter((word) => word.length > 1).map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (words.length === 0) return <>{text}</>;
  const parts = text.split(new RegExp(`(${words.join("|")})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-transparent font-semibold text-forest">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/* ------------------------------------------------------------------ triggers */

const noopSubscribe = () => () => {};

/**
 * The header's search entry. Looks like a field, behaves like a button: one
 * click opens the palette with the cursor already in it.
 */
export function SearchTrigger({ variant = "field", className }: { variant?: "field" | "icon"; className?: string }) {
  const shortcut = useSyncExternalStore(
    noopSubscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘K" : "Ctrl K"),
    () => "Ctrl K",
  );

  const open = (event: React.MouseEvent) => {
    event.preventDefault();
    openSearch();
  };

  if (variant === "icon") {
    return (
      <Link
        href="/search"
        onClick={open}
        aria-haspopup="dialog"
        aria-label="Search medicines, brands and health concerns"
        className={cn(
          "grid size-9 place-items-center rounded-full text-ink transition-colors hover:bg-black/5 hover:text-forest",
          className,
        )}
      >
        <Search aria-hidden className="size-[18px]" strokeWidth={1.75} />
      </Link>
    );
  }

  return (
    <Link
      href="/search"
      onClick={open}
      aria-haspopup="dialog"
      aria-keyshortcuts="Control+K Meta+K /"
      className={cn(
        "group flex h-10 w-[210px] items-center gap-2.5 rounded-full border border-black/10 bg-white/80 pr-2 pl-3.5 text-left shadow-sm backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-300 hover:border-forest/30 hover:bg-white lg:w-[250px] xl:w-[240px] min-[1400px]:w-[280px]",
        className,
      )}
    >
      <Search aria-hidden className="size-4 shrink-0 text-muted-ink transition-colors group-hover:text-forest" strokeWidth={1.9} />
      <span className="min-w-0 flex-1 truncate text-sm text-muted-ink">Search medicines, ailments…</span>
      <kbd className="hidden shrink-0 rounded-md border border-line bg-canvas px-1.5 py-0.5 font-sans text-[0.6875rem] font-medium text-muted-ink lg:inline-block">
        {shortcut}
      </kbd>
    </Link>
  );
}

/* ------------------------------------------------------------------- palette */

/**
 * Site search as a centred dialog (full screen on phones). Mount once, in the
 * header. Opens from any SearchTrigger, from Ctrl/⌘ K, or from "/" outside a
 * text field.
 *
 * Inside: one combobox input (focus never leaves it; arrow keys move through
 * the options via aria-activedescendant, Enter opens, Escape closes), scope
 * filters over the live suggestions, and — before anything is typed — recent
 * searches plus health concerns and brands to browse.
 */
export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const show = () => setOpen(true);
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }
      const target = event.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, select, [contenteditable='true']");
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener(OPEN_EVENT, show);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, show);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // A route change (including one the palette started) always closes it.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // The page must not scroll behind the dialog; Lenis would otherwise keep
  // taking wheel input even with the body locked.
  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    return () => lenis?.start();
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink/25 backdrop-blur-[3px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-200" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            "fixed z-[61] flex flex-col overflow-hidden bg-paper outline-none",
            // Phones: the whole screen. From sm: a centred panel near the top.
            "inset-0 sm:inset-auto sm:top-[10vh] sm:left-1/2 sm:max-h-[min(80vh,46rem)] sm:w-[min(44rem,calc(100vw-3rem))] sm:-translate-x-1/2 sm:rounded-[1.5rem] sm:border sm:border-line-soft sm:shadow-float",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.98] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98] data-[state=open]:slide-in-from-top-2 data-[state=open]:duration-200",
          )}
        >
          <Dialog.Title className="sr-only">Search DocHomoeo</Dialog.Title>
          {open ? <PaletteBody onClose={() => setOpen(false)} /> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PaletteBody({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [result, setResult] = useState<SuggestResult | null>(null);
  // Only ever rendered on the client, after the dialog opens: storage is safe here.
  const [recent, setRecent] = useState<string[]>(readRecent);
  const [browse, setBrowse] = useState<Browse | null>(null);

  const trimmed = query.trim();
  const debounced = useDebounce(trimmed, 160);
  const suggestable = trimmed.length >= MIN_SUGGEST_LENGTH;

  // Client-only data, read once the dialog is open (no hydration involved).
  useEffect(() => {
    let current = true;
    repositories.home.getHomeData().then(
      (home) =>
        current &&
        setBrowse({
          concerns: home.categories.map((c) => ({ name: c.name, slug: c.slug, count: c.productCount })),
          brands: home.brands.slice(0, 8).map((b) => ({ name: b.name, slug: b.slug, count: b.productCount })),
        }),
      () => current && setBrowse({ concerns: [], brands: [] }),
    );
    return () => {
      current = false;
    };
  }, []);

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

  // Keep the previous answer while the next loads, so the list does not
  // collapse on every keystroke — but only while it is still related.
  const related = result !== null && (trimmed.startsWith(result.query) || result.query.startsWith(trimmed));
  const shown = suggestable && related ? result : null;
  const loading = suggestable && result?.query !== trimmed;
  const failed = !loading && shown !== null && shown.data === null;
  const data = shown?.data ?? null;

  const counts: Record<Scope, number> = {
    all: (data?.products.length ?? 0) + (data?.categories.length ?? 0) + (data?.brands.length ?? 0),
    product: data?.products.length ?? 0,
    category: data?.categories.length ?? 0,
    brand: data?.brands.length ?? 0,
  };
  // A scope with nothing in it falls back to All rather than showing a blank list.
  const effectiveScope: Scope = scope !== "all" && counts[scope] === 0 && !loading ? "all" : scope;
  const inScope = (kind: Scope) => effectiveScope === "all" || effectiveScope === kind;

  const options: Option[] = [];
  if (suggestable) {
    options.push({ kind: "query", id: `${baseId}-q`, href: searchHref({ q: trimmed }), label: trimmed });
    if (inScope("product"))
      data?.products.forEach((p, i) =>
        options.push({ kind: "product", id: `${baseId}-p${i}`, href: `/product/${p.slug}`, label: p.name, brand: p.brandName, image: p.imageUrl, price: p.price }),
      );
    if (inScope("category"))
      data?.categories.forEach((c, i) =>
        options.push({ kind: "category", id: `${baseId}-c${i}`, href: `/products?category=${encodeURIComponent(c.slug)}`, label: c.name }),
      );
    if (inScope("brand"))
      data?.brands.forEach((b, i) =>
        options.push({ kind: "brand", id: `${baseId}-b${i}`, href: `/brands/${encodeURIComponent(b.slug)}`, label: b.name }),
      );
    if (effectiveScope === "all")
      options.push({ kind: "doctors", id: `${baseId}-d`, href: `/doctors?q=${encodeURIComponent(trimmed)}`, label: trimmed });
  } else {
    recent.forEach((r, i) => options.push({ kind: "recent", id: `${baseId}-r${i}`, href: searchHref({ q: r }), label: r }));
  }

  const activeIndex = options.findIndex((option) => option.id === activeId);
  const activeOption = activeIndex >= 0 ? options[activeIndex] : undefined;

  const activeOptionId = activeOption?.id;
  useEffect(() => {
    if (activeOptionId) document.getElementById(activeOptionId)?.scrollIntoView({ block: "nearest" });
  }, [activeOptionId]);

  const remember = useCallback((text: string) => {
    const value = text.trim();
    if (value.length < MIN_SUGGEST_LENGTH) return;
    const next = [value, ...readRecent().filter((item) => item.toLowerCase() !== value.toLowerCase())];
    writeRecent(next);
  }, []);

  const go = (href: string, rememberText?: string) => {
    if (rememberText) remember(rememberText);
    startTransition(() => router.push(href));
    onClose();
  };

  const select = (option: Option) => {
    go(option.href, option.kind === "query" || option.kind === "recent" ? option.label : trimmed);
  };

  const move = (delta: 1 | -1) => {
    if (options.length === 0) return;
    const next = activeIndex === -1 ? (delta === 1 ? 0 : options.length - 1) : (activeIndex + delta + options.length) % options.length;
    setActiveId(options[next].id);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeOption) select(activeOption);
      else if (trimmed) go(searchHref({ q: trimmed }), trimmed);
    }
  };

  const removeRecent = (value: string) => {
    const next = readRecent().filter((item) => item !== value);
    writeRecent(next);
    setRecent(next);
  };

  const matchCount = options.filter((option) => option.kind === "product" || option.kind === "category" || option.kind === "brand").length;
  const announcement = !suggestable
    ? ""
    : loading
      ? ""
      : failed
        ? "Suggestions are unavailable. Press Enter to search."
        : matchCount === 0
          ? "No quick matches. Press Enter to search all products."
          : `${matchCount} suggestion${matchCount === 1 ? "" : "s"} available.`;

  return (
    <>
      {/* Input row */}
      <form
        role="search"
        action="/search"
        onSubmit={(event) => {
          event.preventDefault();
          if (trimmed) go(searchHref({ q: trimmed }), trimmed);
        }}
        className="flex items-center gap-2 border-b border-line-soft px-4 sm:px-5"
      >
        <label htmlFor={`${baseId}-input`} className="sr-only">
          Search medicines, brands and health concerns
        </label>
        {isPending ? (
          <Loader2 aria-hidden className="size-5 shrink-0 text-forest motion-safe:animate-spin" />
        ) : (
          <Search aria-hidden className="size-5 shrink-0 text-forest" strokeWidth={1.9} />
        )}
        <input
          ref={inputRef}
          id={`${baseId}-input`}
          name="q"
          type="search"
          role="combobox"
          aria-expanded={options.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeOption?.id}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          autoFocus
          maxLength={MAX_QUERY_LENGTH}
          value={query}
          placeholder="Search medicines, brands…"
          // The dialog itself is the focus context; the site-wide focus ring
          // (unlayered, so classes cannot override it) would box the field.
          style={{ outline: "none" }}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveId(null);
          }}
          onKeyDown={onKeyDown}
          className="h-16 min-w-0 flex-1 bg-transparent text-[1.0625rem] text-ink outline-none placeholder:text-muted-ink/75 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setActiveId(null);
              inputRef.current?.focus();
            }}
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted-ink transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <X aria-hidden className="size-4" />
          </button>
        ) : null}
        <Dialog.Close
          aria-label="Cancel search"
          className="shrink-0 rounded-lg px-2 py-1.5 text-sm font-medium text-forest transition-colors hover:bg-forest/8 sm:border sm:border-line sm:px-1.5 sm:py-0.5 sm:text-[0.6875rem] sm:text-muted-ink sm:hover:bg-canvas"
        >
          <span className="sm:hidden">Cancel</span>
          <span className="hidden sm:inline">Esc</span>
        </Dialog.Close>
      </form>

      {/* Scope filters over the live suggestions */}
      {suggestable ? (
        <div role="group" aria-label="Filter suggestions" className="dh-no-scrollbar flex gap-1.5 overflow-x-auto border-b border-line-soft px-4 py-2.5 sm:px-5">
          {SCOPES.map(({ key, label }) => {
            const pressed = effectiveScope === key;
            const empty = key !== "all" && counts[key] === 0 && !loading;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={pressed}
                disabled={empty}
                onClick={() => {
                  setScope(key);
                  setActiveId(null);
                  inputRef.current?.focus();
                }}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-medium transition-colors",
                  pressed ? "bg-forest-deep text-cream" : "text-ink hover:bg-sage-wash",
                  "disabled:bg-transparent disabled:text-ink/30",
                )}
              >
                {label}
                {!loading && key !== "all" ? (
                  <span className={cn("text-xs tabular-nums", pressed ? "text-cream/70" : "text-muted-ink")}>{counts[key]}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {/* Results / suggestions */}
      <div data-lenis-prevent className="dh-custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {!suggestable && recent.length > 0 ? (
          <div className="flex items-center justify-between px-5 pt-4">
            <p className="dh-eyebrow text-[0.66rem] text-muted-ink">Recent searches</p>
            <button
              type="button"
              onClick={() => {
                writeRecent([]);
                setRecent([]);
                inputRef.current?.focus();
              }}
              className="text-xs font-medium text-forest hover:underline"
            >
              Clear
            </button>
          </div>
        ) : null}
        <div role="listbox" id={listboxId} aria-label="Search suggestions" tabIndex={-1} className="p-2 sm:p-2.5">
          {options.map((option, index) => {
            const startsGroup = index === 0 || options[index - 1].kind !== option.kind;
            return (
              <Fragment key={option.id}>
                {/* Visual group label only: each option says what it is. */}
                {startsGroup && option.kind !== "query" && option.kind !== "recent" && option.kind !== "doctors" ? (
                  <p aria-hidden className="dh-eyebrow px-3 pt-3 pb-2 text-[0.66rem] text-muted-ink">
                    {GROUP_LABELS[option.kind]}
                  </p>
                ) : null}
                <OptionRow
                  option={option}
                  query={trimmed}
                  active={option.id === activeOption?.id}
                  onHover={() => setActiveId(option.id)}
                  onSelect={() => select(option)}
                  onRemove={option.kind === "recent" ? () => removeRecent(option.label) : undefined}
                />
              </Fragment>
            );
          })}
        </div>

        {suggestable && loading && !data ? <ResultsSkeleton /> : null}

        {suggestable && !loading && (failed || matchCount === 0) ? (
          <div className="px-6 pt-6 pb-8 text-center">
            <p className="text-[0.9375rem] font-semibold text-ink">
              {failed ? "Suggestions are unavailable right now" : <>No quick matches for “{trimmed}”</>}
            </p>
            <p className="dh-meta mt-1.5">Press Enter to search the full catalogue, or start from a health concern.</p>
            {browse?.concerns.length ? (
              <ChipRow className="mt-5 justify-center">
                {browse.concerns.slice(0, 6).map((concern) => (
                  <Chip key={concern.slug} href={`/products?category=${encodeURIComponent(concern.slug)}`} onNavigate={go}>
                    {concern.name}
                  </Chip>
                ))}
              </ChipRow>
            ) : null}
          </div>
        ) : null}

        {!suggestable ? <BrowseSuggestions browse={browse} onNavigate={go} /> : null}
      </div>

      {/* Footer: keyboard hints and the full-results link */}
      <div className="hidden items-center justify-between gap-4 border-t border-line-soft bg-canvas/70 px-5 py-2.5 text-xs text-muted-ink sm:flex">
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> to move
          </span>
          <span className="flex items-center gap-1">
            <Kbd>
              <CornerDownLeft className="size-3" />
            </Kbd>
            to open
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Esc</Kbd> to close
          </span>
        </span>
        {suggestable ? (
          <button
            type="button"
            onClick={() => go(searchHref({ q: trimmed }), trimmed)}
            className="inline-flex items-center gap-1.5 font-semibold text-forest hover:text-forest-deep"
          >
            All results for “{trimmed.length > 24 ? `${trimmed.slice(0, 24)}…` : trimmed}”
            <ArrowRight aria-hidden className="size-3.5" />
          </button>
        ) : (
          <Link href="/products" onClick={onClose} className="inline-flex items-center gap-1.5 font-semibold text-forest hover:text-forest-deep">
            Browse all products
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        )}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- pieces */

function OptionRow({
  option,
  query,
  active,
  onHover,
  onSelect,
  onRemove,
}: {
  option: Option;
  query: string;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
  onRemove?: () => void;
}) {
  return (
    <div
      role="option"
      id={option.id}
      aria-selected={active}
      // Focus stays in the input so the combobox never loses its place.
      onMouseDown={(event) => event.preventDefault()}
      onMouseMove={active ? undefined : onHover}
      onClick={onSelect}
      className={cn(
        "group/opt flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink transition-colors",
        active ? "bg-sage-wash" : "hover:bg-sage-wash/60",
      )}
    >
      {option.kind === "query" ? (
        <>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-forest text-cream">
            <Search aria-hidden className="size-4" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1 truncate">
            Search for <span className="font-semibold">“{option.label}”</span>
          </span>
          <ArrowRight aria-hidden className={cn("size-4 shrink-0 text-forest transition-opacity", active ? "opacity-100" : "opacity-0")} />
        </>
      ) : option.kind === "doctors" ? (
        <>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-sage-wash text-forest">
            <Stethoscope aria-hidden className="size-4" strokeWidth={1.8} />
          </span>
          <span className="min-w-0 flex-1 truncate">
            Search doctors for <span className="font-semibold">“{option.label}”</span>
          </span>
          <ArrowRight aria-hidden className={cn("size-4 shrink-0 text-forest transition-opacity", active ? "opacity-100" : "opacity-0")} />
        </>
      ) : option.kind === "recent" ? (
        <>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink/5 text-muted-ink">
            <Clock aria-hidden className="size-4" strokeWidth={1.8} />
          </span>
          <span className="min-w-0 flex-1 truncate">{option.label}</span>
          {onRemove ? (
            <button
              type="button"
              tabIndex={-1}
              aria-label={`Remove ${option.label} from recent searches`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => {
                event.stopPropagation();
                onRemove();
              }}
              className="grid size-7 shrink-0 place-items-center rounded-full text-muted-ink opacity-0 transition-opacity group-hover/opt:opacity-100 hover:bg-ink/5 hover:text-ink"
            >
              <X aria-hidden className="size-3.5" />
            </button>
          ) : null}
        </>
      ) : option.kind === "product" ? (
        <>
          <ProductThumb imageUrl={option.image} name={option.label} sizes="44px" className="size-11 shrink-0 rounded-lg" />
          <span className="min-w-0 flex-1">
            <span className="block truncate">
              <Highlight text={option.label} query={query} />
            </span>
            {option.brand ? <span className="block truncate text-xs text-muted-ink">{option.brand}</span> : null}
          </span>
          <span className="shrink-0 text-sm font-semibold tabular-nums">{formatPrice({ amount: option.price, currency: "INR" })}</span>
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
          <span className="min-w-0 flex-1 truncate">
            <Highlight text={option.label} query={query} />
          </span>
          <span className="shrink-0 rounded-full bg-canvas px-2 py-0.5 text-[0.6875rem] text-muted-ink">
            {option.kind === "category" ? "Category" : "Brand"}
          </span>
        </>
      )}
    </div>
  );
}

function BrowseSuggestions({ browse, onNavigate }: { browse: Browse | null; onNavigate: (href: string) => void }) {
  if (!browse) {
    return (
      <div className="space-y-5 px-5 pt-2 pb-6" aria-hidden>
        {[0, 1].map((row) => (
          <div key={row}>
            <div className="h-3 w-32 rounded bg-ink/6" />
            <div className="mt-3 flex flex-wrap gap-2">
              {[88, 110, 72, 120, 96].map((w, i) => (
                <div key={i} className="h-9 rounded-full bg-ink/5 motion-safe:animate-pulse" style={{ width: w }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 px-5 pt-2 pb-6">
      {browse.concerns.length ? (
        <section aria-label="Browse by health concern">
          <p className="dh-eyebrow text-[0.66rem] text-muted-ink">Browse by health concern</p>
          <ChipRow className="mt-3">
            {browse.concerns.map((concern) => (
              <Chip key={concern.slug} href={`/products?category=${encodeURIComponent(concern.slug)}`} count={concern.count} onNavigate={onNavigate}>
                {concern.name}
              </Chip>
            ))}
          </ChipRow>
        </section>
      ) : null}
      {browse.brands.length ? (
        <section aria-label="Popular brands">
          <p className="dh-eyebrow text-[0.66rem] text-muted-ink">Brands</p>
          <ChipRow className="mt-3">
            {browse.brands.map((brand) => (
              <Chip key={brand.slug} href={`/brands/${encodeURIComponent(brand.slug)}`} count={brand.count} onNavigate={onNavigate}>
                {brand.name}
              </Chip>
            ))}
          </ChipRow>
        </section>
      ) : null}
    </div>
  );
}

function ChipRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap gap-2", className)}>{children}</div>;
}

function Chip({
  href,
  count,
  children,
  onNavigate,
}: {
  href: string;
  count?: number;
  children: ReactNode;
  onNavigate: (href: string) => void;
}) {
  return (
    <Link
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(href);
      }}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-soft bg-paper px-3.5 text-[0.8125rem] text-ink transition-colors hover:border-forest/40 hover:bg-sage-wash/50 hover:text-forest"
    >
      {children}
      {count !== undefined ? (
        <span className="text-xs text-muted-ink tabular-nums">
          {count}
          <span className="sr-only"> products</span>
        </span>
      ) : null}
    </Link>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-1 px-2.5 pb-4" aria-hidden>
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="size-11 shrink-0 rounded-lg bg-ink/5 motion-safe:animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/5 rounded bg-ink/6 motion-safe:animate-pulse" />
            <div className="h-2.5 w-1/4 rounded bg-ink/5 motion-safe:animate-pulse" />
          </div>
          <div className="h-3 w-12 rounded bg-ink/5 motion-safe:animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-grid h-5 min-w-5 place-items-center rounded border border-line bg-paper px-1 font-sans text-[0.6875rem] font-medium text-muted-ink">
      {children}
    </kbd>
  );
}
