"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/services/products.service";

// Loads /products/categories once. Returns an empty list (not an error) on
// failure so a categories outage never blocks the product list itself.
export function useCategories(): { categories: string[]; isLoading: boolean } {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCategories().then(
      (cats) => {
        if (!active) return;
        setCategories(cats);
        setIsLoading(false);
      },
      () => {
        if (!active) return;
        setIsLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  return { categories, isLoading };
}
