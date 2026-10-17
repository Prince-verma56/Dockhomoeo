import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/lib/repositories";
import type { ApiSearchFilters } from "@/types/api/search";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: ApiSearchFilters = {
      q: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      brand: searchParams.get("brand")?.split(",").filter(Boolean) ?? undefined,
      form: searchParams.get("form")?.split(",").filter(Boolean) ?? undefined,
      potency: searchParams.get("potency")?.split(",").filter(Boolean) ?? undefined,
      pack: searchParams.get("pack")?.split(",").filter(Boolean) ?? undefined,
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      discount: searchParams.get("discount") ? Number(searchParams.get("discount")) : undefined,
      rating: searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined,
      inStock: searchParams.get("inStock") === "1" ? true : undefined,
      sort: (searchParams.get("sort") as ApiSearchFilters["sort"]) ?? undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 24,
    };

    const result = await repositories.search.search(filters);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to search products";
    return NextResponse.json({ message }, { status: 500 });
  }
}
