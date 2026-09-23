"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, isAuthenticated } from "@/services/auth.service";
import type { AppError } from "@/services/api";

// Only allow same-origin paths as post-login target (prevents open redirects).
function resolveNext(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/products";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("emilys");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  // C5: while true, the form is disabled and re-submits are ignored.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already logged in? Skip the form entirely.
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace(resolveNext(searchParams.get("next")));
    }
  }, [router, searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    // C5: fast repeated clicks/teclas Enter must not fire N requests.
    if (isSubmitting) return;

    if (!username.trim() || !password) {
      setFieldError("Username and password are required.");
      return;
    }
    setFieldError(null);
    setApiError(null);
    setIsSubmitting(true);
    try {
      await login({ username: username.trim(), password });
      router.replace(resolveNext(searchParams.get("next")));
    } catch (error) {
      setApiError((error as AppError).message ?? "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold">Admin login</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Use <code className="rounded bg-zinc-100 px-1">emilys</code> /{" "}
          <code className="rounded bg-zinc-100 px-1">emilyspass</code>
        </p>

        <label className="mt-4 block text-sm font-medium" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isSubmitting}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 disabled:opacity-50"
        />

        <label className="mt-3 block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 disabled:opacity-50"
        />

        {fieldError && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {fieldError}
          </p>
        )}
        {apiError && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {apiError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Logging in…" : "Login"}
        </button>
      </form>
    </div>
  );
}

// useSearchParams requires a Suspense boundary in the App Router.
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
