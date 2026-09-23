export default function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16" role="status" aria-label={label}>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      <p className="text-sm text-zinc-500">{label}</p>
    </div>
  );
}
