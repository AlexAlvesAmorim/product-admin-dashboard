"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/types/product";

export interface OverlayInput {
  added: Product[];
  updated: Record<number, Product>;
  deletedIds: number[];
}

interface ProductStore extends OverlayInput {
  stageAdd: (product: Product) => void;
  stageUpdate: (product: Product) => void;
  stageDelete: (id: number) => void;
  findLocal: (id: number) => Product | undefined;
  isDeleted: (id: number) => boolean;
  // True for products created in this session: they only exist in the overlay,
  // so PUT/DELETE against the API would 404 and must be skipped.
  isLocalOnly: (id: number) => boolean;
}

const ProductStoreContext = createContext<ProductStore | null>(null);

// C3: DummyJSON accepts POST/PUT/DELETE but never persists them.
// This client-side overlay stages those mutations so the UI reflects them:
// - added products are prepended on page 1 of the default view,
// - updates replace the matching item everywhere,
// - deletes hide the item everywhere.
export function ProductStoreProvider({ children }: { children: ReactNode }) {
  const [added, setAdded] = useState<Product[]>([]);
  const [updated, setUpdated] = useState<Record<number, Product>>({});
  const [deletedIds, setDeletedIds] = useState<number[]>([]);

  const stageAdd = useCallback((product: Product) => {
    setAdded((prev) => [product, ...prev]);
  }, []);

  const stageUpdate = useCallback((product: Product) => {
    setUpdated((prev) => ({ ...prev, [product.id]: product }));
    setAdded((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  }, []);

  const stageDelete = useCallback((id: number) => {
    setDeletedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setAdded((prev) => prev.filter((p) => p.id !== id));
    setUpdated((prev) => {
      if (!(id in prev)) return prev;
      const rest = { ...prev };
      delete rest[id];
      return rest;
    });
  }, []);

  const findLocal = useCallback(
    (id: number): Product | undefined => added.find((p) => p.id === id) ?? updated[id],
    [added, updated],
  );

  const isDeleted = useCallback((id: number): boolean => deletedIds.includes(id), [deletedIds]);

  const isLocalOnly = useCallback((id: number): boolean => added.some((p) => p.id === id), [added]);

  const value = useMemo<ProductStore>(
    () => ({ added, updated, deletedIds, stageAdd, stageUpdate, stageDelete, findLocal, isDeleted, isLocalOnly }),
    [added, updated, deletedIds, stageAdd, stageUpdate, stageDelete, findLocal, isDeleted, isLocalOnly],
  );

  return <ProductStoreContext.Provider value={value}>{children}</ProductStoreContext.Provider>;
}

export function useProductStore(): ProductStore {
  const store = useContext(ProductStoreContext);
  if (!store) throw new Error("useProductStore must be used inside ProductStoreProvider.");
  return store;
}

// Merges one API page with the local overlay. Added items only join page 1 of
// the default view (no search/filter/sort), otherwise they would corrupt
// server-side result sets and ordering. Totals are approximate by design: the
// fake API cannot tell us where deleted items lived.
export function applyOverlay(
  items: Product[],
  total: number,
  overlay: OverlayInput,
  view: { page: number; isDefault: boolean },
): { products: Product[]; total: number } {
  const live = items
    .filter((p) => !overlay.deletedIds.includes(p.id))
    .map((p) => overlay.updated[p.id] ?? p);
  if (view.isDefault && view.page === 1 && overlay.added.length > 0) {
    return { products: [...overlay.added, ...live], total: total + overlay.added.length };
  }
  return { products: live, total };
}
