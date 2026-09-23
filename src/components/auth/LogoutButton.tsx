"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/services/auth.service";

// Small logout action used in the products shell.
// Clears token + user, then replaces history so "back" does not return to a protected page.
export default function LogoutButton() {
  const router = useRouter();

  function handleLogout(): void {
    logout();
    router.replace("/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm transition-colors hover:bg-zinc-100"
    >
      Logout
    </button>
  );
}
