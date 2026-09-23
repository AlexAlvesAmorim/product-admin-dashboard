"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "@/services/auth.service";

interface AuthGuardProps {
  children: ReactNode;
}

// Client-side route guard for /products*.
// Why client-side: the token lives in localStorage, which middleware (server)
// cannot read. So protection happens here: unauthenticated users are replaced
// to /login?next=<original path>, preserving where they wanted to go.
export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  // Read once during initial render (client-only component, localStorage is safe).
  // No setState-in-effect: the effect below only talks to the router.
  const [allowed] = useState(() => isAuthenticated());

  useEffect(() => {
    if (!allowed) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [allowed, router, pathname]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Checking authentication">
        <p className="animate-pulse text-zinc-500">Checking authentication…</p>
      </div>
    );
  }

  return <>{children}</>;
}
