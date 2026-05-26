"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { errorMessage, formatDate } from "@/lib/format";
import type { Onboarding } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column } from "@/components/data-table";

const STATUSES = [
  "received",
  "in_progress",
  "scheduled",
  "delivered",
  "cancelled",
] as const;

export default function OnboardingPage() {
  const [items, setItems] = useState<Onboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      const res = await api.get(`/onboarding/admin/all?${params.toString()}`);
      const data = res.data?.data ?? res.data;
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to load onboarding requests"));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, next: string) => {
    const prev = items;
    setItems((list) =>
      list.map((o) =>
        o._id === id ? { ...o, status: next as Onboarding["status"] } : o
      )
    );
    try {
      await api.put(`/onboarding/admin/${id}`, { status: next });
      toast.success("Status updated");
    } catch (err) {
      setItems(prev);
      toast.error(errorMessage(err, "Failed to update status"));
    }
  };

  const columns: Column<Onboarding>[] = useMemo(
    () => [
      {
        key: "customer",
        header: "Customer",
        cell: (o) => (
          <div>
            <div className="font-medium">{o.customerName ?? "—"}</div>
            <div className="text-muted-foreground text-xs">
              {o.customerEmail ?? ""}
            </div>
          </div>
        ),
      },
      {
        key: "company",
        header: "Company",
        cell: (o) => (
          <span className="text-muted-foreground">{o.company ?? "—"}</span>
        ),
      },
      {
        key: "tenant",
        header: "M365 tenant",
        cell: (o) => (
          <span className="text-muted-foreground">{o.m365Tenant ?? "—"}</span>
        ),
      },
      {
        key: "window",
        header: "Preferred window",
        cell: (o) => (
          <span className="text-muted-foreground">
            {o.preferredWindow ?? "—"}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: "Received",
        cell: (o) => (
          <span className="text-muted-foreground">
            {formatDate(o.createdAt)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (o) => (
          <Select
            value={o.status ?? "received"}
            onValueChange={(v) => updateStatus(o._id, v)}
          >
            <SelectTrigger size="sm" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  );

  return (
    <div>
      <PageHeader
        title="Onboarding"
        description="Done-for-you delivery requests and their progress."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={items}
        getRowId={(o) => o._id}
        loading={loading}
        emptyMessage="No onboarding requests found."
      />
    </div>
  );
}
