"use client";

import type { ReactNode } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import LogoutButton from "@/components/auth/LogoutButton";

// Shell for every /products* route: guard first, then a minimal header with logout.
// The product table/cards will render as children in the next step.
export default function ProductsLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-50">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
          <span className="font-semibold">Product Admin</span>
          <LogoutButton />
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
