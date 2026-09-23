import api from "./api";
import type {
  CategoryRaw,
  Product,
  ProductFormData,
  ProductListResponse,
  ProductQuery,
} from "@/types/product";

interface SearchParams extends ProductQuery {
  q: string;
  signal?: AbortSignal;
  // Pass delay=2000 to reproduce slow networks and verify stale responses never win.
  delay?: number;
}

interface CategoryParams extends ProductQuery {
  category: string;
  signal?: AbortSignal;
}

interface ListParams extends ProductQuery {
  signal?: AbortSignal;
}

function withSorting(params: ProductQuery): Record<string, string | number> {
  const out: Record<string, string | number> = {
    limit: params.limit,
    skip: params.skip,
  };
  if (params.sortBy) {
    out.sortBy = params.sortBy;
    out.order = params.order ?? "asc";
  }
  return out;
}

// GET /products — plain paginated listing.
export async function listProducts(params: ListParams): Promise<ProductListResponse> {
  const { data } = await api.get<ProductListResponse>("/products", {
    params: withSorting(params),
    signal: params.signal,
  });
  return data;
}

// GET /products/search — used whenever the search box is non-empty.
export async function searchProducts(params: SearchParams): Promise<ProductListResponse> {
  const { data } = await api.get<ProductListResponse>("/products/search", {
    params: { q: params.q, ...withSorting(params), ...(params.delay ? { delay: params.delay } : {}) },
    signal: params.signal,
  });
  return data;
}

// GET /products/category/:category — used when there is no search text.
export async function listByCategory(params: CategoryParams): Promise<ProductListResponse> {
  const { data } = await api.get<ProductListResponse>(
    `/products/category/${encodeURIComponent(params.category)}`,
    { params: withSorting(params), signal: params.signal },
  );
  return data;
}

// GET /products/categories — normalized to string[] for the UI.
export async function getCategories(): Promise<string[]> {
  const { data } = await api.get<CategoryRaw[]>("/products/categories");
  return data.map((c) => (typeof c === "string" ? c : c.slug));
}

// GET /products/:id — detail page. A 404 here drives the not-found UI.
export async function getProductById(id: number, signal?: AbortSignal): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${id}`, { signal });
  return data;
}

// POST /products/add — DummyJSON does not persist; caller merges locally (see C3).
export async function addProduct(payload: ProductFormData): Promise<Product> {
  const { data } = await api.post<Product>("/products/add", payload);
  return data;
}

// PUT /products/:id — same fake-persistence caveat as add.
export async function updateProduct(id: number, payload: Partial<ProductFormData>): Promise<Product> {
  const { data } = await api.put<Product>(`/products/${id}`, payload);
  return data;
}

// DELETE /products/:id — same fake-persistence caveat as add.
export async function deleteProduct(id: number): Promise<Product> {
  const { data } = await api.delete<Product>(`/products/${id}`);
  return data;
}
