"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Boxes,
  CheckCircle2,
  DollarSign,
  Download,
  Eye,
  FileText,
  FolderTree,
  Mail,
  ShoppingCart,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

import api from "@/lib/axios";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

type TopPack = {
  _id?: string;
  title: string;
  slug: string;
  views?: number;
  downloads?: number;
  status?: string;
};
type TopPost = {
  _id?: string;
  title: string;
  slug: string;
  views?: number;
};
type CatRow = {
  name: string;
  slug: string;
  views: number;
  downloads: number;
  solutions: number;
};

type Stats = {
  solutions: number;
  publishedPacks: number;
  posts: number;
  orders: number;
  paidOrders: number;
  newLeads: number;
  users: number;
  subscribers: number;
  categories: number;
  revenueUsdCents: number;
  totalPackViews: number;
  totalBlogViews: number;
  totalViews: number;
  totalDownloads: number;
  topPacks: TopPack[];
  topPosts: TopPost[];
  viewsByCategory: CatRow[];
};

const num = (n?: number) => new Intl.NumberFormat("en-US").format(n ?? 0);
const formatUsd = (cents?: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((cents ?? 0) / 100);

function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;
  return (
    <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
      <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get("/admin/stats");
        if (active) setStats(res.data?.data ?? res.data);
      } catch (err: any) {
        if (active)
          setError(
            err?.response?.data?.message || err.message || "Failed to load stats"
          );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const cards = [
    { label: "Total views", value: num(stats?.totalViews), icon: Eye },
    { label: "Downloads", value: num(stats?.totalDownloads), icon: Download },
    {
      label: "Revenue",
      value: formatUsd(stats?.revenueUsdCents),
      icon: DollarSign,
    },
    { label: "Paid orders", value: num(stats?.paidOrders), icon: Wallet },
    { label: "Solutions", value: num(stats?.solutions), icon: Boxes },
    {
      label: "Published",
      value: num(stats?.publishedPacks),
      icon: CheckCircle2,
    },
    { label: "Blog posts", value: num(stats?.posts), icon: FileText },
    { label: "Orders", value: num(stats?.orders), icon: ShoppingCart },
    { label: "New leads", value: num(stats?.newLeads), icon: Sparkles },
    { label: "Subscribers", value: num(stats?.subscribers), icon: Mail },
    { label: "Users", value: num(stats?.users), icon: Users },
    { label: "Categories", value: num(stats?.categories), icon: FolderTree },
  ];

  const maxPackViews = Math.max(
    1,
    ...(stats?.topPacks ?? []).map((p) => p.views ?? 0)
  );
  const maxCatViews = Math.max(
    1,
    ...(stats?.viewsByCategory ?? []).map((c) => c.views ?? 0)
  );
  const maxPostViews = Math.max(
    1,
    ...(stats?.topPosts ?? []).map((p) => p.views ?? 0)
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Views, downloads, revenue and content performance at a glance."
      />

      {error && (
        <div className="border-destructive/40 bg-destructive/10 text-destructive mb-6 rounded-md border px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold">
                    {loading ? "—" : card.value}
                  </p>
                </div>
                <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-lg">
                  <Icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insights */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top products */}
        <Card>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Top products by views</h2>
              <Link href="/solutions" className="text-muted-foreground hover:text-foreground text-xs">
                View all
              </Link>
            </div>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : (stats?.topPacks ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm">No solutions yet.</p>
            ) : (
              <ul className="space-y-4">
                {stats!.topPacks.map((p) => (
                  <li key={p.slug}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <span className="truncate font-medium">{p.title}</span>
                      <span className="text-muted-foreground shrink-0 tabular-nums">
                        <Eye className="mr-1 inline size-3.5" />
                        {num(p.views)}
                        <Download className="mr-1 ml-3 inline size-3.5" />
                        {num(p.downloads)}
                      </span>
                    </div>
                    <Bar value={p.views ?? 0} max={maxPackViews} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Views by category */}
        <Card>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Views by category</h2>
              <Link href="/categories" className="text-muted-foreground hover:text-foreground text-xs">
                Manage
              </Link>
            </div>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : (stats?.viewsByCategory ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm">No categories yet.</p>
            ) : (
              <ul className="space-y-4">
                {stats!.viewsByCategory.map((c) => (
                  <li key={c.slug}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <span className="truncate font-medium">{c.name}</span>
                      <span className="text-muted-foreground shrink-0 tabular-nums">
                        {num(c.views)} views · {num(c.downloads)} dl ·{" "}
                        {num(c.solutions)} solutions
                      </span>
                    </div>
                    <Bar value={c.views} max={maxCatViews} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top blog posts */}
      <div className="mt-6">
        <Card>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Top blog posts by views</h2>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground text-xs">
                View all
              </Link>
            </div>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : (stats?.topPosts ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No blog posts yet.
              </p>
            ) : (
              <ul className="space-y-4">
                {stats!.topPosts.map((p) => (
                  <li key={p.slug}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <span className="truncate font-medium">{p.title}</span>
                      <span className="text-muted-foreground shrink-0 tabular-nums">
                        <Eye className="mr-1 inline size-3.5" />
                        {num(p.views)}
                      </span>
                    </div>
                    <Bar value={p.views ?? 0} max={maxPostViews} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
