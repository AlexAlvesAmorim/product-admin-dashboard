"use client";

interface SortSelectProps {
  value: string;
  onChange: (sort: string) => void;
}

// Values match parseSort() in utils/url-state ("price-asc", "rating-desc", …).
// Sorting is server-side via DummyJSON sortBy/order params.
export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div>
      <label htmlFor="sort-select" className="sr-only">Sort products</label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2"
      >
        <option value="">Sort: Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating-desc">Rating: High to Low</option>
        <option value="rating-asc">Rating: Low to High</option>
        <option value="title-asc">Title: A to Z</option>
        <option value="title-desc">Title: Z to A</option>
      </select>
    </div>
  );
}
