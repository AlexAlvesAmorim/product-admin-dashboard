export default function EmptyState({
  title = "No products found",
  hint = "Try a different search or category.",
}: {
  title?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{hint}</p>
    </div>
  );
}
