"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { errorMessage } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type SearchResult = {
  type?: string;
  id?: string;
  _id?: string;
  title?: string;
  label?: string;
  subtitle?: string;
  href?: string;
};

// Maps a result entity type to its admin route prefix.
const ROUTE_FOR: Record<string, string> = {
  pack: "/packs",
  blog: "/blog",
  order: "/orders",
  lead: "/leads",
  user: "/users",
};

function resolveHref(r: SearchResult) {
  if (r.href) return r.href;
  const id = r.id ?? r._id;
  const base = r.type ? ROUTE_FOR[r.type] : undefined;
  return base && id ? `${base}/${id}` : undefined;
}

function SearchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";

  const [q, setQ] = useState(initial);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(!!initial);

  const run = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setTouched(true);
    try {
      const res = await api.get(
        `/admin/search?q=${encodeURIComponent(term.trim())}`
      );
      const data = res.data?.data ?? res.data;
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(errorMessage(err, "Search failed"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      run(q);
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      router.replace(`/search${params.toString() ? `?${params}` : ""}`);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div>
      <PageHeader
        title="Search"
        description="Find packs, posts, orders, leads and users."
      />

      <div className="relative mb-6 max-w-xl">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          autoFocus
          placeholder="Search everything…"
          className="pl-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Searching…
        </div>
      ) : touched && results.length === 0 ? (
        <p className="text-muted-foreground text-sm">No results found.</p>
      ) : (
        <div className="grid gap-2">
          {results.map((r, i) => {
            const href = resolveHref(r);
            const title = r.title ?? r.label ?? "Untitled";
            const body = (
              <CardContent className="flex items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{title}</p>
                  {r.subtitle && (
                    <p className="text-muted-foreground truncate text-sm">
                      {r.subtitle}
                    </p>
                  )}
                </div>
                {r.type && (
                  <Badge variant="outline" className="capitalize">
                    {r.type}
                  </Badge>
                )}
              </CardContent>
            );
            return href ? (
              <Link key={`${r.type}-${r.id ?? r._id ?? i}`} href={href}>
                <Card className="hover:bg-accent/50 py-0 transition-colors">
                  {body}
                </Card>
              </Link>
            ) : (
              <Card key={i} className="py-0">
                {body}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground flex items-center gap-2 py-16 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading…
        </div>
      }
    >
      <SearchInner />
    </Suspense>
  );
}
