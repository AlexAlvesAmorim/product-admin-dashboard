// Manual pagination helpers (Rule R3: no pagination library).

export function getSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function getTotalPages(total: number, limit: number): number {
  if (limit <= 0) return 1;
  return Math.max(1, Math.ceil(total / limit));
}

// Builds the "Showing 21–40 of 194" range. Returns zeros when there is nothing to show.
export function getShowingRange(page: number, limit: number, total: number): { from: number; to: number } {
  if (total === 0) return { from: 0, to: 0 };
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  if (from > total) return { from: 0, to: 0 };
  return { from, to };
}

// Windowed page numbers with ellipsis, e.g. [1, "…", 4, 5, 6, "…", 12].
export function getPageNumbers(current: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, 2, current - 1, current, current + 1, totalPages - 1, totalPages]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}
