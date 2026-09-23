"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import axios from "axios";
import ProductForm from "@/components/products/ProductForm";
import Loader from "@/components/ui/Loader";
import ErrorState from "@/components/ui/ErrorState";
import { getProductById, updateProduct } from "@/services/products.service";
import { useProductStore } from "@/store/productStore";
import type { AppError } from "@/services/api";
import type { Product, ProductFormData } from "@/types/product";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const validId = Number.isInteger(productId) && productId > 0;
  const router = useRouter();
  const store = useProductStore();

  // Local overlay wins over the API: an edited/added product is already the
  // freshest version, so no fetch is needed for it.
  const localProduct = validId ? store.findLocal(productId) : undefined;
  const wasDeleted = validId ? store.isDeleted(productId) : false;

  const [product, setProduct] = useState<Product | null>(localProduct ?? null);
  const [isLoading, setIsLoading] = useState(!localProduct);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    // Local overlay resolves synchronously during render below;
    // only API-backed products are fetched here.
    if (!validId || wasDeleted || localProduct) return;
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);
    setMissing(false);

    getProductById(productId, controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return;
        setProduct(data);
        setIsLoading(false);
      },
      (err: unknown) => {
        if (controller.signal.aborted || axios.isCancel(err) || (err as { code?: string })?.code === "ERR_CANCELED") return;
        if ((err as AppError)?.status === 404) {
          setMissing(true);
          setIsLoading(false);
          return;
        }
        setError((err as AppError)?.message ?? "Failed to load the product.");
        setIsLoading(false);
      },
    );

    return () => controller.abort();
  }, [productId, validId, wasDeleted, localProduct, retryKey]);

  if (!validId || wasDeleted || missing) {
    notFound();
  }

  // Local overlay wins over fetch state: it is already the freshest version.
  const display = localProduct ?? product;

  async function handleSubmit(data: ProductFormData): Promise<void> {
    if (!display) return;
    setServerError(null);
    try {
      // C3: the API acknowledges but never persists; stage the merged product locally.
      // Session-created products don't exist server-side, so skip the PUT for them.
      if (!store.isLocalOnly(display.id)) {
        await updateProduct(display.id, data);
      }
      store.stageUpdate({ ...display, ...data });
      router.push(`/products/${display.id}`);
    } catch (err) {
      setServerError((err as AppError)?.message ?? "Failed to save the product.");
    }
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => setRetryKey((k) => k + 1)} />;
  }

  if (isLoading || !display) {
    return <Loader label="Loading product…" />;
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link href={`/products/${display.id}`} className="text-sm text-zinc-600 hover:underline">
        ← Back to product
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Edit product</h1>
      <div className="mt-4">
        <ProductForm
          initial={{
            title: display.title,
            description: display.description,
            category: display.category,
            price: display.price,
            stock: display.stock,
          }}
          submitLabel="Save changes"
          serverError={serverError}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
