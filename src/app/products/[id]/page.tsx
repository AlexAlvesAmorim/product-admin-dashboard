"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import axios from "axios";
import { getProductById } from "@/services/products.service";
import { useProductStore } from "@/store/productStore";
import DeleteProductButton from "@/components/products/DeleteProductButton";
import Loader from "@/components/ui/Loader";
import ErrorState from "@/components/ui/ErrorState";
import { formatPrice } from "@/utils/format";
import type { AppError } from "@/services/api";
import type { Product } from "@/types/product";

function isNotFoundError(error: unknown): boolean {
  return (error as AppError)?.status === 404;
}

function isCancelError(error: unknown): boolean {
  return axios.isCancel(error) || (error as { code?: string })?.code === "ERR_CANCELED";
}

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const validId = Number.isInteger(productId) && productId > 0;
  const store = useProductStore();

  // Local overlay first: an added/edited product is already the freshest
  // version (no fetch needed); a deleted one renders not-found directly.
  const localProduct = validId ? store.findLocal(productId) : undefined;
  const wasDeleted = validId ? store.isDeleted(productId) : false;

  const [product, setProduct] = useState<Product | null>(localProduct ?? null);
  const [isLoading, setIsLoading] = useState(!localProduct);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [activeImage, setActiveImage] = useState(0);

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
        setActiveImage(0);
        setIsLoading(false);
      },
      (err: unknown) => {
        if (controller.signal.aborted || isCancelError(err)) return;
        if (isNotFoundError(err)) {
          setMissing(true);
          setIsLoading(false);
          return;
        }
        setError((err as AppError)?.message ?? "Failed to load the display.");
        setIsLoading(false);
      },
    );

    return () => controller.abort();
  }, [productId, validId, wasDeleted, localProduct, retryKey]);

  // Wrong id format (e.g. /products/abc) never hits the API;
  // API 404 flips `missing`, and locally deleted ids resolve here too.
  if (!validId || wasDeleted || missing) {
    notFound();
  }

  // Local overlay wins over fetch state: it is already the freshest version.
  const display = localProduct ?? product;

  if (error) {
    return <ErrorState message={error} onRetry={() => setRetryKey((k) => k + 1)} />;
  }

  if (isLoading || !display) {
    return <Loader label="Loading product…" />;
  }

  const images = display.images?.length ? display.images : [display.thumbnail];
  const safeActive = Math.min(activeImage, images.length - 1);

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link href="/products" className="text-sm text-zinc-600 hover:underline">
          ← Back to products
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/products/${display.id}/edit`}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100"
          >
            Edit
          </Link>
          <DeleteProductButton id={display.id} title={display.title} redirectTo="/products" />
        </div>
      </div>

      <div className="mt-4 grid gap-6 rounded-xl border border-zinc-200 bg-white p-6 md:grid-cols-2">
        <div>
          <img
            src={images[safeActive]}
            alt={display.title}
            className="h-80 w-full rounded-xl object-cover"
          />
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`shrink-0 rounded-lg border-2 ${i === safeActive ? "border-zinc-900" : "border-transparent"}`}
                >
                  <img src={src} alt="" className="h-16 w-16 rounded-md object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-zinc-500">{display.category}</p>
          <h1 className="mt-1 text-2xl font-semibold">{display.title}</h1>
          <p className="mt-2 text-2xl font-bold">{formatPrice(display.price)}</p>
          <p className="mt-2 text-sm text-zinc-600">
            ★ {display.rating} · <span className={display.stock < 10 ? "font-medium text-red-600" : ""}>{display.stock} in stock</span>
          </p>
          <p className="mt-4 text-zinc-700">{display.description}</p>
        </div>
      </div>

      <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="font-semibold">Reviews</h2>
        {display.reviews?.length ? (
          <ul className="mt-3 space-y-4">
            {display.reviews.map((r, i) => (
              <li key={`${r.reviewerEmail}-${i}`} className="border-t border-zinc-100 pt-3 first:border-0 first:pt-0">
                <p className="text-sm font-medium">{r.reviewerName} · ★ {r.rating}</p>
                <p className="mt-1 text-sm text-zinc-600">{r.comment}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">No reviews yet.</p>
        )}
      </section>
    </div>
  );
}
