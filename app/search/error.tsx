"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RotateCw } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { SearchCombobox } from "@/components/search/SearchCombobox";
import { Button } from "@/components/ui/button";

/**
 * The search request failed. The query is still in the URL, so "Try again"
 * re-runs the same search; the field below allows a different one.
 */
export default function SearchError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const query = useSearchParams().get("q")?.trim() ?? "";

  return (
    <section className="bg-ivory pt-24 pb-16 sm:pt-28 lg:pb-24">
      <Container>
        <div role="alert" className="max-w-2xl">
          <h1 className="font-display text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
            Search is unavailable right now
          </h1>
          <p className="mt-3 text-base text-muted-ink">
            {query ? <>We couldn’t load results for “{query}”. </> : null}
            This is usually temporary. Try again, or browse the catalogue instead.
          </p>
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button type="button" variant="brand" size="xl" onClick={() => retry()}>
            <RotateCw aria-hidden />
            Try again
          </Button>
          <Button asChild variant="brandOutline" size="xl">
            <Link href="/products">Browse all products</Link>
          </Button>
        </div>
        <SearchCombobox defaultQuery={query} className="mt-10 max-w-2xl" />
      </Container>
    </section>
  );
}
