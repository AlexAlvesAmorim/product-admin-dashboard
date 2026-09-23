"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { listByCategory, listProducts, searchProducts } from "@/services/products.service";
import { applyOverlay, useProductStore } from "@/store/productStore";
import { getSkip } from "@/utils/pagination";
import { parseSort, type ProductUrlState } from "@/utils/url-state";
import type { Product } from "@/types/product";

interface UseProductsResult {
  products: Product[];
  total: number;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

// Manual data fetching (Rule R3: no React Query/SWR).
// Race-safe (C1): every state change aborts the previous request and bumps a
// monotonic requestId; a late response whose id is stale is ignored, so an old
// search can never overwrite a newer one.
// Local CRUD overlay (C3) merges via useMemo — no refetch needed after add/edit/delete.
export function useProducts(state: ProductUrlState): UseProductsResult {
  const store = useProductStore();
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [apiTotal, setApiTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const requestId = useRef(0);

  const retry = useCallback(() => setRetryKey((k) => k + 1), []);

  useEffect(() => {
    const current = (requestId.current += 1);
    const controller = new AbortController();
    // Intentional synchronous reset: a new request lifecycle starts here, so the
    // UI must enter loading state now. Not derived state (what the lint rule
    // targets) — late responses are still guarded by requestId + abort below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);

    const { sortBy, order } = parseSort(state.sort);
    const base = {
      limit: state.limit,
      skip: getSkip(state.page, state.limit),
      sortBy,
      order,
      signal: controller.signal,
    };
    const q = state.q.trim();

    // C2: the API cannot search and filter by category at once.
    // Search wins; category is ignored while a search term is present.
    const request = q
      ? searchProducts({ ...base, q })
      : state.category
        ? listByCategory({ ...base, category: state.category })
        : listProducts(base);

    request.then(
      (data) => {
        if (requestId.current !== current) return;
        setApiProducts(data.products);
        setApiTotal(data.total);
        setIsLoading(false);
      },
      (err) => {
        if (requestId.current !== current) return;
        if (controller.signal.aborted || axios.isCancel(err) || err?.code === "ERR_CANCELED") return;
        setError(err?.message ?? "Failed to load products.");
        setIsLoading(false);
      },
    );

    return () => controller.abort();
  }, [state.page, state.limit, state.q, state.category, state.sort, retryKey]);

  const isDefaultView = !state.q.trim() && !state.category && !state.sort;

  const { products, total } = useMemo(
    () =>
      applyOverlay(
        apiProducts,
        apiTotal,
        { added: store.added, updated: store.updated, deletedIds: store.deletedIds },
        { page: state.page, isDefault: isDefaultView },
      ),
    [apiProducts, apiTotal, store.added, store.updated, store.deletedIds, state.page, isDefaultView],
  );

  return { products, total, isLoading, error, retry };
}
