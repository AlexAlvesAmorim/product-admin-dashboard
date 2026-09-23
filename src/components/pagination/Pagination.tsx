import { ALLOWED_LIMITS } from "@/utils/url-state";
import { getPageNumbers, getShowingRange, getTotalPages } from "@/utils/pagination";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const BTN = "rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50";

// Pure presentational pagination (Rule R3: no pagination library).
// The parent owns the URL; this component only reports intent via callbacks.
export default function Pagination({ page, limit, total, onPageChange, onLimitChange }: PaginationProps) {
  const totalPages = getTotalPages(total, limit);
  const { from, to } = getShowingRange(page, limit, total);
  const numbers = getPageNumbers(page, totalPages);

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-zinc-600">
        Showing {from}–{to} of {total}
      </p>

      <nav aria-label="Pagination" className="flex flex-wrap items-center gap-1.5">
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className={BTN}>
          Previous
        </button>
        {numbers.map((n, i) =>
          n === "…" ? (
            <span key={`gap-${i}`} className="px-1 text-zinc-400">…</span>
          ) : (
            <button
              key={n}
              type="button"
              aria-current={n === page ? "page" : undefined}
              onClick={() => onPageChange(n)}
              className={`${BTN} ${n === page ? "bg-zinc-900 text-white hover:bg-zinc-900" : ""}`}
            >
              {n}
            </button>
          ),
        )}
        <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className={BTN}>
          Next
        </button>
      </nav>

      <label className="flex items-center gap-2 text-sm text-zinc-600">
        Per page
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5"
        >
          {ALLOWED_LIMITS.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
