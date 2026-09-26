"use client";

import { useEffect, useState } from "react";
import { FIX_CATEGORIES, type FixCategory } from "./fix-catalog";

export function useFixCatalog() {
  const [categories, setCategories] = useState<FixCategory[]>(FIX_CATEGORIES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data.categories) && data.categories.length) {
          setCategories(data.categories);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, ready };
}
