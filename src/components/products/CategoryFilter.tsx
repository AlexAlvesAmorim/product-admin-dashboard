"use client";

import { useCategories } from "@/hooks/useCategories";

interface CategoryFilterProps {
  value: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const { categories, isLoading } = useCategories();

  return (
    <div>
      <label htmlFor="category-filter" className="sr-only">Filter by category</label>
      <select
        id="category-filter"
        value={value}
        disabled={isLoading}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 disabled:opacity-50"
      >
        <option value="">{isLoading ? "Loading categories…" : "All categories"}</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
