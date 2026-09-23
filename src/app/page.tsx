import Link from "next/link";

// Temporary home: entry point that routes to login and products.
// The product list (with URL state) will live at /products.
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Product Admin Dashboard</h1>
      <p className="max-w-md text-zinc-600">
        Log in with <code className="rounded bg-zinc-200 px-1">emilys</code> /{" "}
        <code className="rounded bg-zinc-200 px-1">emilyspass</code> to manage products from DummyJSON.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-white transition-colors hover:bg-zinc-700"
        >
          Go to login
        </Link>
        <Link
          href="/products"
          className="rounded-full border border-zinc-300 px-5 py-2.5 transition-colors hover:bg-zinc-100"
        >
          View products
        </Link>
      </div>
    </div>
  );
}
