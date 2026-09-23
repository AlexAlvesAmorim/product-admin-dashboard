import Link from "next/link";
import type { Product } from "@/types/product";
import { formatPrice } from "@/utils/format";

// Mobile cards (hidden on md+ where the table takes over).
export default function ProductCards({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:hidden">
      {products.map((p) => (
        <article key={p.id} className="rounded-xl border border-zinc-200 bg-white p-4">
          <Link href={`/products/${p.id}`} className="block">
            <img
              src={p.thumbnail}
              alt={p.title}
              loading="lazy"
              className="h-40 w-full rounded-lg object-cover"
            />
            <h2 className="mt-3 font-medium hover:underline">{p.title}</h2>
          </Link>
          <p className="mt-1 text-sm text-zinc-500">{p.category}</p>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="font-semibold">{formatPrice(p.price)}</span>
            <span>★ {p.rating}</span>
            <span className={p.stock < 10 ? "font-medium text-red-600" : "text-zinc-600"}>
              {p.stock} left
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
