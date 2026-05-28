"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { errorMessage, formatDateTime, formatUsdCents } from "@/lib/format";
import type { Order } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (q.trim()) params.set("q", q.trim());
      const res = await api.get(`/orders/admin/all?${params.toString()}`);
      const data = res.data?.data ?? res.data;
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to load orders"));
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const columns: Column<Order>[] = useMemo(
    () => [
      {
        key: "customerEmail",
        header: "Customer",
        cell: (o) => <span className="font-medium">{o.customerEmail ?? "—"}</span>,
      },
      {
        key: "solution",
        header: "Solution",
        cell: (o) => (
          <span className="text-muted-foreground">
            {o.packSlugSnapshot ?? "—"}
          </span>
        ),
      },
      {
        key: "tier",
        header: "Tier",
        cell: (o) =>
          o.tier ? (
            <Badge variant="outline" className="capitalize">
              {o.tier.replace(/_/g, " ")}
            </Badge>
          ) : (
            "—"
          ),
      },
      {
        key: "amount",
        header: "Amount",
        cell: (o) => formatUsdCents(o.amountUsdCents),
      },
      {
        key: "provider",
        header: "Provider",
        cell: (o) => (
          <span className="text-muted-foreground capitalize">
            {o.paymentProvider ?? "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (o) => <StatusBadge status={o.status} />,
      },
      {
        key: "createdAt",
        header: "Date",
        cell: (o) => (
          <span className="text-muted-foreground">
            {formatDateTime(o.createdAt)}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="Orders"
        description="One-time solution purchases and their fulfillment status."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search by email…"
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="fulfilled">Fulfilled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={orders}
        getRowId={(o) => o._id}
        loading={loading}
        emptyMessage="No orders found."
        onRowClick={(o) => router.push(`/orders/${o._id}`)}
      />
    </div>
  );
}
