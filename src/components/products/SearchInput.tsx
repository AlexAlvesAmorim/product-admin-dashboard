"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchInputProps {
  value: string;
  onSearch: (q: string) => void;
  delay?: number;
}

// Search box: local state updates on every keystroke (responsive UI),
// but the URL/API only updates after `delay` ms of silence (debounced).
export default function SearchInput({ value, onSearch, delay = 400 }: SearchInputProps) {
  const [text, setText] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const debounced = useDebounce(text, delay);

  // Follows the URL when it changes from outside (back/forward, shared link).
  // State-during-render sync (React-endorsed) instead of setState-in-effect.
  if (value !== prevValue) {
    setPrevValue(value);
    setText(value);
  }

  // Propagates to the parent only when the settled value differs from the URL.
  useEffect(() => {
    if (debounced !== value) onSearch(debounced);
  }, [debounced, value, onSearch]);

  return (
    <div className="relative flex-1">
      <label htmlFor="product-search" className="sr-only">Search products</label>
      <input
        id="product-search"
        type="search"
        placeholder="Search products…"
        autoComplete="off"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
      />
    </div>
  );
}
