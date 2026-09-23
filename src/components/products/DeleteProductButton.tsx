"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/services/products.service";
import { useProductStore } from "@/store/productStore";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { AppError } from "@/services/api";

interface DeleteProductButtonProps {
  id: number;
  title: string;
  redirectTo?: string;
  compact?: boolean;
}

// Self-contained delete action: opens the confirm popup, calls the API, then
// stages the deletion in the local overlay (C3). Double confirms are ignored (C5).
export default function DeleteProductButton({ id, title, redirectTo, compact = false }: DeleteProductButtonProps) {
  const router = useRouter();
  const { stageDelete, isLocalOnly } = useProductStore();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm(): Promise<void> {
    if (isDeleting) return;
    setIsDeleting(true);
    setError(null);
    try {
      // Session-created products don't exist server-side; the API call would
      // 404, so only the overlay changes for them.
      if (!isLocalOnly(id)) {
        await deleteProduct(id);
      }
      stageDelete(id);
      setConfirming(false);
      if (redirectTo) router.replace(redirectTo);
    } catch (err) {
      setError((err as AppError)?.message ?? "Failed to delete the product.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setConfirming(true);
        }}
        className={
          compact
            ? "text-sm text-red-600 hover:underline"
            : "rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
        }
      >
        Delete
      </button>
      {confirming && (
        <ConfirmDialog
          title="Delete product"
          message={`Delete "${title}"? This cannot be undone.`}
          isBusy={isDeleting}
          error={error}
          onConfirm={handleConfirm}
          onCancel={() => {
            if (!isDeleting) setConfirming(false);
          }}
        />
      )}
    </>
  );
}
