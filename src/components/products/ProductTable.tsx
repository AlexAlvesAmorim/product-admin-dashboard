import Link from "next/link";
import type { Product } from "@/types/product";
import { formatPrice } from "@/utils/format";

// Desktop table (hidden on mobile; cards take over there).
export default function ProductTable({ products }: { products: Product[] }) {
  return (
    <div className="hidden overflow-x-auto rounded-xl border border-zinc-200 bg-white md:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 text-zinc-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Product</th>
            <th scope="col" className="px-4 py-3 font-medium">Category</th>
            <th scope="col" className="px-4 py-3 font-medium">Price</th>
            <th scope="col" className="px-4 py-3 font-medium">Rating</th>
            <th scope="col" className="px-4 py-3 font-medium">Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t border-zinc-100 hover:bg-zinc-50">
              <td className="px-4 py-3">
                <Link href={`/products/${p.id}`} className="flex items-center gap-3">
                  {/* Plain <img>: avoids next/image remote-pattern config for the DummyJSON CDN. */}
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    loading="lazy"
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                  <span className="font-medium hover:underline">{p.title}</span>
                </Link>
              </td>
              <td className="px-4 py-3 text-zinc-600">{p.category}</td>
              <td className="px-4 py-3 font-medium">{formatPrice(p.price)}</td>
              <td className="px-4 py-3">★ {p.rating}</td>
              <td className={`px-4 py-3 ${p.stock < 10 ? "font-medium text-red-600" : ""}`}>{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
