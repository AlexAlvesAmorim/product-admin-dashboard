"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import axios from "axios";
import { getProductById } from "@/services/products.service";
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

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!Number.isInteger(productId) || productId <= 0) return;
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
        setError((err as AppError)?.message ?? "Failed to load the product.");
        setIsLoading(false);
      },
    );

    return () => controller.abort();
  }, [productId, retryKey]);

  // Wrong id format (e.g. /products/abc) never hits the API;
  // API 404 flips `missing` and renders the same not-found UI.
  if (!Number.isInteger(productId) || productId <= 0 || missing) {
    notFound();
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => setRetryKey((k) => k + 1)} />;
  }

  if (isLoading || !product) {
    return <Loader label="Loading product…" />;
  }

  const images = product.images?.length ? product.images : [product.thumbnail];
  const safeActive = Math.min(activeImage, images.length - 1);

  return (
    <div>
      <Link href="/products" className="text-sm text-zinc-600 hover:underline">
        ← Back to products
      </Link>

      <div className="mt-4 grid gap-6 rounded-xl border border-zinc-200 bg-white p-6 md:grid-cols-2">
        <div>
          <img
            src={images[safeActive]}
            alt={product.title}
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
          <p className="text-sm text-zinc-500">{product.category}</p>
          <h1 className="mt-1 text-2xl font-semibold">{product.title}</h1>
          <p className="mt-2 text-2xl font-bold">{formatPrice(product.price)}</p>
          <p className="mt-2 text-sm text-zinc-600">
            ★ {product.rating} · <span className={product.stock < 10 ? "font-medium text-red-600" : ""}>{product.stock} in stock</span>
          </p>
          <p className="mt-4 text-zinc-700">{product.description}</p>
        </div>
      </div>

      <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="font-semibold">Reviews</h2>
        {product.reviews?.length ? (
          <ul className="mt-3 space-y-4">
            {product.reviews.map((r, i) => (
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
