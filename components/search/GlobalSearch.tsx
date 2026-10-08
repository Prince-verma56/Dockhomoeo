"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { repositories } from "@/lib/repositories";
import { ApiSuggestResponse } from "@/types/api/search";
import Image from "next/image";
import { useDebounce } from "@/lib/hooks/useDebounce";

export function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [suggestions, setSuggestions] = useState<ApiSuggestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.trim().length < 2) {
        setSuggestions(null);
        return;
      }
      setIsLoading(true);
      try {
        const results = await repositories.search.suggest(debouncedQuery);
        setSuggestions(results);
      } catch (error) {
        console.error("Suggest failed", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center transition-all duration-300 w-[210px] lg:w-[250px] xl:w-[280px]"
      >
        <Search
          aria-hidden="true"
          className="absolute left-3.5 size-4 text-[#4b6b5a] pointer-events-none"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search medicines, ailments..."
          className="h-10 w-full rounded-full border border-black/10 bg-white/80 backdrop-blur-sm pl-9.5 pr-9 text-sm text-[#0a2015] placeholder:text-[#4b6b5a] outline-none transition-all duration-300 shadow-sm focus:border-[#1b7a54]/50 focus:bg-white focus:ring-2 focus:ring-[#1b7a54]/10"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 size-5 rounded-full flex items-center justify-center text-[#4b6b5a] hover:bg-black/5"
          >
            <X className="size-3.5" />
          </button>
        )}
      </form>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-[320px] md:w-[480px] bg-white rounded-2xl shadow-xl border border-black/5 overflow-hidden z-50">
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 flex justify-center text-[#4b6b5a]">
                <Loader2 className="size-6 animate-spin" />
              </div>
            ) : suggestions ? (
              <div className="p-2">
                {suggestions.products.length > 0 ? (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-[#4b6b5a] uppercase tracking-wider">
                      Medicines
                    </div>
                    {suggestions.products.slice(0, 5).map((p) => (
                      <Link
                        key={p.slug}
                        href={`/product/${p.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#f4f7f5] transition-colors"
                      >
                        <div className="size-12 rounded-lg bg-white border border-black/5 flex items-center justify-center shrink-0 overflow-hidden relative">
                          {p.imageUrl ? (
                            <Image src={p.imageUrl} alt={p.name} fill className="object-contain p-2" />
                          ) : (
                            <span className="font-serif text-[#0a2015]/30 text-lg">{p.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-[#0a2015] truncate">{p.name}</div>
                          {p.brandName && (
                            <div className="text-xs text-[#1b7a54] truncate">{p.brandName}</div>
                          )}
                        </div>
                        <div className="text-sm font-bold text-[#0a2015]">
                          ₹{p.price}
                        </div>
                      </Link>
                    ))}
                  </>
                ) : (
                  <div className="p-4 text-center text-sm text-[#4b6b5a]">
                    No medicines found for "{query}"
                  </div>
                )}
              </div>
            ) : null}
          </div>
          
          <div className="p-2 border-t border-black/5 bg-[#f4f7f5]">
            <Link 
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full p-2 text-sm font-semibold text-[#1b7a54] hover:bg-[#e7f0ec] rounded-xl transition-colors"
            >
              See all results for "{query}"
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
