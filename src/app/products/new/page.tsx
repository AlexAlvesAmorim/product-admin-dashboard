"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/products/ProductForm";
import { addProduct } from "@/services/products.service";
import { useProductStore } from "@/store/productStore";
import { PLACEHOLDER_THUMBNAIL } from "@/utils/placeholder";
import type { AppError } from "@/services/api";
import type { ProductFormData } from "@/types/product";

export default function NewProductPage() {
  const router = useRouter();
  const { stageAdd } = useProductStore();
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(data: ProductFormData): Promise<void> {
    setServerError(null);
    try {
      const created = await addProduct(data);
      // C3: the API echoes the product but never persists it. Stage it locally
      // with a unique client-side id (the API reuses ids across calls, which
      // would collide in a list). It appears on top of page 1, default view.
      stageAdd({
        ...created,
        ...data,
        id: Date.now(),
        thumbnail: PLACEHOLDER_THUMBNAIL,
        images: [PLACEHOLDER_THUMBNAIL],
        rating: created.rating ?? 0,
        reviews: [],
      });
      router.push("/products");
    } catch (err) {
      setServerError((err as AppError)?.message ?? "Failed to create the product.");
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/products" className="text-sm text-zinc-600 hover:underline">
        ← Back to products
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Add product</h1>
      <div className="mt-4">
        <ProductForm submitLabel="Create product" serverError={serverError} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
