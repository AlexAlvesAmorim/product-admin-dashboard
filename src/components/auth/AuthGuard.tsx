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
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setAllowed(true);
    } else {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [router, pathname]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Checking authentication">
        <p className="animate-pulse text-zinc-500">Checking authentication…</p>
      </div>
    );
  }

  return <>{children}</>;
}
