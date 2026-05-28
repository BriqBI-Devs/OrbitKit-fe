"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { errorMessage, formatDate } from "@/lib/format";
import type { Lead } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (q.trim()) params.set("q", q.trim());
      const res = await api.get(`/leads/admin/all?${params.toString()}`);
      const data = res.data?.data ?? res.data;
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to load leads"));
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const remove = async (id: string) => {
    try {
      await api.delete(`/leads/admin/${id}`);
      toast.success("Lead deleted");
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete lead"));
    }
  };

  const columns: Column<Lead>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        cell: (l) => <span className="font-medium">{l.name ?? "—"}</span>,
      },
      {
        key: "email",
        header: "Email",
        cell: (l) => (
          <span className="text-muted-foreground">{l.email ?? "—"}</span>
        ),
      },
      {
        key: "company",
        header: "Company",
        cell: (l) => (
          <span className="text-muted-foreground">{l.company ?? "—"}</span>
        ),
      },
      {
        key: "solution",
        header: "Interested in",
        cell: (l) => (
          <span className="text-muted-foreground">
            {l.packOfInterest ?? "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (l) => <StatusBadge status={l.status} />,
      },
      {
        key: "createdAt",
        header: "Received",
        cell: (l) => (
          <span className="text-muted-foreground">
            {formatDate(l.createdAt)}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        headClassName: "text-right",
        className: "text-right",
        cell: (l) => (
          <div
            className="flex justify-end"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              title="Delete"
              onClick={() => setDeleteId(l._id)}
            >
              <Trash2 className="text-destructive size-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Inbound enquiries from the contact form."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search leads…"
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
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={leads}
        getRowId={(l) => l._id}
        loading={loading}
        emptyMessage="No leads found."
        onRowClick={(l) => router.push(`/leads/${l._id}`)}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete lead?"
        description="This permanently removes the lead and its notes."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleteId) remove(deleteId);
        }}
      />
    </div>
  );
}
