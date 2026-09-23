import Link from "next/link";

// Rendered when getProductById returns 404 (or the id is not a number).
export default function ProductNotFound() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
      <h1 className="text-lg font-semibold">Product not found</h1>
      <p className="mt-1 text-sm text-zinc-500">
        The product you are looking for does not exist or was removed.
      </p>
      <Link
        href="/products"
        className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
      >
        Back to products
      </Link>
    </div>
  );
}
