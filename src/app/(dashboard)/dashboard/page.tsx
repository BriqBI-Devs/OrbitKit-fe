"use client";

import { useEffect, useState } from "react";
import {
  Boxes,
  CheckCircle2,
  DollarSign,
  FileText,
  ShoppingCart,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

import api from "@/lib/axios";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

type Stats = {
  packs: number;
  publishedPacks: number;
  posts: number;
  orders: number;
  paidOrders: number;
  newLeads: number;
  users: number;
  revenueUsdCents: number;
};

const formatUsd = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((cents ?? 0) / 100);

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
            err?.response?.data?.message ||
              err.message ||
              "Failed to load stats"
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
    { label: "Packs", value: stats?.packs, icon: Boxes },
    {
      label: "Published packs",
      value: stats?.publishedPacks,
      icon: CheckCircle2,
    },
    { label: "Blog posts", value: stats?.posts, icon: FileText },
    { label: "Orders", value: stats?.orders, icon: ShoppingCart },
    { label: "Paid orders", value: stats?.paidOrders, icon: Wallet },
    { label: "New leads", value: stats?.newLeads, icon: Sparkles },
    { label: "Users", value: stats?.users, icon: Users },
    {
      label: "Revenue",
      value:
        stats?.revenueUsdCents !== undefined
          ? formatUsd(stats.revenueUsdCents)
          : undefined,
      icon: DollarSign,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of packs, content, orders and customers."
      />

      {error && (
        <div className="border-destructive/40 bg-destructive/10 text-destructive mb-6 rounded-md border px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold">
                    {loading ? "—" : (card.value ?? 0)}
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
    </div>
  );
}
