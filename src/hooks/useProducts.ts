"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { listByCategory, listProducts, searchProducts } from "@/services/products.service";
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
export function useProducts(state: ProductUrlState): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const requestId = useRef(0);

  const retry = useCallback(() => setRetryKey((k) => k + 1), []);

  useEffect(() => {
    const current = (requestId.current += 1);
    const controller = new AbortController();
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
        setProducts(data.products);
        setTotal(data.total);
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

  return { products, total, isLoading, error, retry };
}
