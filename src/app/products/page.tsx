"use client";

import { Suspense, useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import ProductTable from "@/components/products/ProductTable";
import ProductCards from "@/components/products/ProductCards";
import SearchInput from "@/components/products/SearchInput";
import CategoryFilter from "@/components/products/CategoryFilter";
import SortSelect from "@/components/products/SortSelect";
import Pagination from "@/components/pagination/Pagination";
import Loader from "@/components/ui/Loader";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import {
  buildProductSearchParams,
  clampPage,
  parseProductUrlState,
} from "@/utils/url-state";
import { getTotalPages } from "@/utils/pagination";

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL is the source of truth (R2): refresh/share reproduces this exact view.
  const state = useMemo(() => parseProductUrlState(searchParams), [searchParams]);
  const { products, total, isLoading, error, retry } = useProducts(state);
  const totalPages = getTotalPages(total, state.limit);

  const updateUrl = useCallback(
    (patch: { page?: number; limit?: number; q?: string; category?: string; sort?: string }) => {
      const params = buildProductSearchParams({
        ...state,
        page: patch.page ?? state.page,
        limit: patch.limit ?? state.limit,
        q: patch.q ?? state.q,
        category: patch.category ?? state.category,
        sort: patch.sort ?? state.sort,
      });
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, state],
  );

  // C4: ?page=999 (or a page left over from a narrower filter) clamps to the
  // last available page once the total is known, instead of showing broken UI.
  useEffect(() => {
    if (!isLoading && !error) {
      const clamped = clampPage(state.page, totalPages);
      if (clamped !== state.page) updateUrl({ page: clamped });
    }
  }, [isLoading, error, totalPages, state.page, updateUrl]);

  function handlePageChange(page: number): void {
    updateUrl({ page });
  }

  function handleLimitChange(limit: number): void {
    // A new page size restarts from page 1 (same rule search/filter will use).
    updateUrl({ limit, page: 1 });
  }

  // Search, filter and sort always restart from page 1: the previous page
  // number belongs to a different result set and may not exist anymore.
  function handleSearch(q: string): void {
    updateUrl({ q, page: 1 });
  }

  function handleCategoryChange(category: string): void {
    updateUrl({ category, page: 1 });
  }

  function handleSortChange(sort: string): void {
    updateUrl({ sort, page: 1 });
  }

  const searchActive = state.q.trim().length > 0;

  if (error) {
    return <ErrorState message={error} onRetry={retry} />;
  }

  if (isLoading) {
    return <Loader label="Loading products…" />;
  }

  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <SearchInput value={state.q} onSearch={handleSearch} />
        <div className="flex gap-2">
          <CategoryFilter value={state.category} onChange={handleCategoryChange} />
          <SortSelect value={state.sort} onChange={handleSortChange} />
        </div>
      </div>
      {/* C2: the API cannot combine search + category. Search wins; the
          category choice is kept in the URL and applies again once the
          search is cleared. */}
      {searchActive && state.category && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Search is active, so the category filter is temporarily ignored.
        </p>
      )}
      <ProductTable products={products} />
      <ProductCards products={products} />
      <Pagination
        page={state.page}
        limit={state.limit}
        total={total}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<Loader label="Loading products…" />}>
      <ProductsContent />
    </Suspense>
  );
}
