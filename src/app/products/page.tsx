"use client";

import { Suspense, useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import ProductTable from "@/components/products/ProductTable";
import ProductCards from "@/components/products/ProductCards";
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
    (patch: { page?: number; limit?: number }) => {
      const params = buildProductSearchParams({
        ...state,
        page: patch.page ?? state.page,
        limit: patch.limit ?? state.limit,
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
