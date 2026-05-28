"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import api from "@/lib/axios";
import {
  errorMessage,
  formatDate,
  formatDateTime,
  formatUsdCents,
} from "@/lib/format";
import type { Subscription } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      const res = await api.get(
        `/subscriptions/admin/all?${params.toString()}`
      );
      const data = res.data?.data ?? res.data;
      setSubs(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to load subscriptions"));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = useCallback(
    async (id: string) => {
      if (!window.confirm("Cancel this subscription? This cannot be undone."))
        return;
      setCancelingId(id);
      try {
        await api.post(`/subscriptions/${id}/cancel`);
        toast.success("Subscription cancelled");
        await load();
      } catch (err) {
        toast.error(errorMessage(err, "Failed to cancel subscription"));
      } finally {
        setCancelingId(null);
      }
    },
    [load]
  );

  const columns: Column<Subscription>[] = useMemo(
    () => [
      {
        key: "customerEmail",
        header: "Customer",
        cell: (s) => (
          <span className="font-medium">{s.customerEmail ?? "—"}</span>
        ),
      },
      {
        key: "solution",
        header: "Solution",
        cell: (s) => (
          <span className="text-muted-foreground">
            {s.packSlugSnapshot ?? "—"}
          </span>
        ),
      },
      {
        key: "price",
        header: "Price / mo",
        cell: (s) => formatUsdCents(s.priceUsdCents),
      },
      {
        key: "provider",
        header: "Provider",
        cell: (s) => (
          <span className="text-muted-foreground capitalize">
            {s.paymentProvider ?? "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (s) => <StatusBadge status={s.status} />,
      },
      {
        key: "renews",
        header: "Renews",
        cell: (s) => (
          <span className="text-muted-foreground">
            {formatDate(s.currentPeriodEnd)}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: "Started",
        cell: (s) => (
          <span className="text-muted-foreground">
            {formatDateTime(s.createdAt)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        cell: (s) =>
          s.status === "active" ||
          s.status === "past_due" ||
          s.status === "pending" ? (
            <Button
              variant="outline"
              size="sm"
              disabled={cancelingId === s._id}
              onClick={() => handleCancel(s._id)}
            >
              {cancelingId === s._id ? "Cancelling…" : "Cancel"}
            </Button>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          ),
      },
    ],
    [cancelingId, handleCancel]
  );

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        description="Recurring managed-service subscriptions."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="past_due">Past due</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={subs}
        getRowId={(s) => s._id}
        loading={loading}
        emptyMessage="No subscriptions found."
      />
    </div>
  );
}
