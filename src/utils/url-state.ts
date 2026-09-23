import type { SortOrder, SortableField } from "@/types/product";

export const ALLOWED_LIMITS = [10, 20, 50] as const;
export const DEFAULT_LIMIT = 10;
export const DEFAULT_PAGE = 1;

export interface ProductUrlState {
  page: number;
  limit: number;
  q: string;
  category: string;
  sort: string; // e.g. "price-asc" or "" for none
}

function parsePage(raw: string | null): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_PAGE;
  return Math.floor(n);
}

function parseLimit(raw: string | null): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (ALLOWED_LIMITS.includes(n as (typeof ALLOWED_LIMITS)[number])) return n;
  return DEFAULT_LIMIT;
}

export function parseSort(raw: string | null): { sortBy?: SortableField; order?: SortOrder } {
  if (!raw) return {};
  const [field, order] = raw.split("-");
  const validField = field === "price" || field === "rating" || field === "title";
  const validOrder = order === "asc" || order === "desc";
  if (!validField || !validOrder) return {};
  return { sortBy: field, order };
}

// Reads URLSearchParams and returns sanitized state (Careful point C4).
// Invalid values like ?page=abc fall back to safe defaults instead of breaking.
export function parseProductUrlState(params: URLSearchParams): ProductUrlState {
  return {
    page: parsePage(params.get("page")),
    limit: parseLimit(params.get("limit")),
    q: (params.get("search") ?? params.get("q") ?? "").slice(0, 100),
    category: (params.get("category") ?? "").slice(0, 100),
    sort: params.get("sort") ?? "",
  };
}

// Clamps an out-of-range page (e.g. ?page=999) to the last available page.
export function clampPage(page: number, totalPages: number): number {
  if (totalPages < 1) return 1;
  if (page < 1) return 1;
  if (page > totalPages) return totalPages;
  return page;
}

export function buildProductSearchParams(state: ProductUrlState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.page > 1) params.set("page", String(state.page));
  if (state.limit !== DEFAULT_LIMIT) params.set("limit", String(state.limit));
  if (state.q) params.set("search", state.q);
  if (state.category) params.set("category", state.category);
  if (state.sort) params.set("sort", state.sort);
  return params;
}
