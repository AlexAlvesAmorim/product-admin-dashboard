"use client";

import { useEffect, useState } from "react";

// Returns a debounced copy of `value` that only updates after `delay` ms of silence.
// Used by the search input so we call /products/search after the user stops typing.
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
