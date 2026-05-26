"use client";

import { useEffect, useState } from "react";

import api from "@/lib/axios";
import type { Category } from "@/lib/types";

/** Loads categories of a given kind for select dropdowns. */
export function useCategories(kind: "pack" | "blog") {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get(`/categories?kind=${kind}`);
        const data = res.data?.data ?? res.data;
        if (active) setCategories(Array.isArray(data) ? data : []);
      } catch {
        if (active) setCategories([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [kind]);

  return { categories, loading };
}
