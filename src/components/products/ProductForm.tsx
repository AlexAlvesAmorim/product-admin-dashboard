"use client";

import { useState, type FormEvent } from "react";
import { useCategories } from "@/hooks/useCategories";
import type { ProductFormData } from "@/types/product";

interface ProductFormProps {
  initial?: Partial<ProductFormData>;
  submitLabel: string;
  serverError: string | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

type FieldErrors = Partial<Record<keyof ProductFormData, string>>;

const INPUT = "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 disabled:opacity-50";
const LABEL = "mt-3 block text-sm font-medium";
const FIELD_ERROR = "mt-1 text-sm text-red-600";

function validate(values: ProductFormData): FieldErrors {
  const errors: FieldErrors = {};
  if (values.title.trim().length < 3) errors.title = "Title needs at least 3 characters.";
  if (values.description.trim().length < 10) errors.description = "Description needs at least 10 characters.";
  if (!values.category) errors.category = "Choose a category.";
  if (!Number.isFinite(values.price) || values.price <= 0) errors.price = "Price must be greater than 0.";
  if (!Number.isInteger(values.stock) || values.stock < 0) errors.stock = "Stock must be 0 or more.";
  return errors;
}

// Shared add/edit form with hand-rolled validation (no form library on purpose).
// Guards double submits internally (C5); server errors are owned by the parent.
export default function ProductForm({ initial, submitLabel, serverError, onSubmit }: ProductFormProps) {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [price, setPrice] = useState(initial?.price !== undefined ? String(initial.price) : "");
  const [stock, setStock] = useState(initial?.stock !== undefined ? String(initial.stock) : "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions =
    initial?.category && !categories.includes(initial.category)
      ? [initial.category, ...categories]
      : categories;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isSubmitting) return;

    const values: ProductFormData = {
      title: title.trim(),
      description: description.trim(),
      category,
      price: Number(price),
      stock: Number(stock),
    };
    const errors = validate(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-zinc-200 bg-white p-6">
      <label className={LABEL} htmlFor="product-title">Title</label>
      <input
        id="product-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isSubmitting}
        aria-invalid={Boolean(fieldErrors.title)}
        className={INPUT}
      />
      {fieldErrors.title && <p className={FIELD_ERROR}>{fieldErrors.title}</p>}

      <label className={LABEL} htmlFor="product-description">Description</label>
      <textarea
        id="product-description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isSubmitting}
        rows={4}
        aria-invalid={Boolean(fieldErrors.description)}
        className={INPUT}
      />
      {fieldErrors.description && <p className={FIELD_ERROR}>{fieldErrors.description}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={LABEL} htmlFor="product-category">Category</label>
          <select
            id="product-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isSubmitting || categoriesLoading}
            aria-invalid={Boolean(fieldErrors.category)}
            className={INPUT}
          >
            <option value="">{categoriesLoading ? "Loading…" : "Select…"}</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {fieldErrors.category && <p className={FIELD_ERROR}>{fieldErrors.category}</p>}
        </div>

        <div>
          <label className={LABEL} htmlFor="product-price">Price (USD)</label>
          <input
            id="product-price"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isSubmitting}
            placeholder="0.00"
            aria-invalid={Boolean(fieldErrors.price)}
            className={INPUT}
          />
          {fieldErrors.price && <p className={FIELD_ERROR}>{fieldErrors.price}</p>}
        </div>

        <div>
          <label className={LABEL} htmlFor="product-stock">Stock</label>
          <input
            id="product-stock"
            inputMode="numeric"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            disabled={isSubmitting}
            placeholder="0"
            aria-invalid={Boolean(fieldErrors.stock)}
            className={INPUT}
          />
          {fieldErrors.stock && <p className={FIELD_ERROR}>{fieldErrors.stock}</p>}
        </div>
      </div>

      {serverError && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 w-full rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
